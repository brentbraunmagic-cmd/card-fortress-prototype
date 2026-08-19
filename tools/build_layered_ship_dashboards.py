from pathlib import Path
import json

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat


ROOT = Path("outputs/card-fortress-prototype")
ASSETS = ROOT / "assets"


SHIPS = {
    "fortress": {
        "source": "dashboard-fortress-fullwidth-v2.png",
        "suits": {
            "clubs": (1210, 282, 1380, 438),
            "diamonds": (1540, 282, 1710, 438),
            "hearts": (1210, 544, 1380, 700),
            "spades": (1540, 544, 1710, 700),
        },
        "hits": {
            "clubs": [0.5995, 0.2630, 0.1690, 0.3045],
            "diamonds": [0.7685, 0.2630, 0.1725, 0.3045],
            "hearts": [0.5995, 0.5745, 0.1690, 0.2950],
            "spades": [0.7685, 0.5745, 0.1725, 0.2950],
        },
    },
    "strike": {
        "source": "dashboard-strike-fullwidth-v2.png",
        "suits": {
            "clubs": (1585, 265, 1780, 440),
            "hearts": (1810, 255, 2035, 445),
            "spades": (1610, 500, 1815, 690),
            "diamonds": (1820, 495, 2038, 690),
        },
        "hits": {
            "clubs": [0.7622, 0.3107, 0.1101, 0.2846],
            "hearts": [0.8748, 0.3107, 0.1165, 0.2846],
            "spades": [0.7856, 0.6110, 0.1096, 0.3003],
            "diamonds": [0.8967, 0.6110, 0.0980, 0.3003],
        },
    },
    "interceptor": {
        "source": "dashboard-interceptor-fullwidth-v2.png",
        "suits": {
            "clubs": (60, 240, 290, 450),
            "spades": (60, 525, 290, 735),
            "hearts": (1560, 240, 1790, 450),
            "diamonds": (1560, 525, 1790, 735),
        },
        "hits": {
            "clubs": [0.015, 0.238, 0.143, 0.292],
            "spades": [0.015, 0.551, 0.143, 0.292],
            "hearts": [0.823, 0.238, 0.143, 0.292],
            "diamonds": [0.823, 0.551, 0.143, 0.292],
        },
    },
}


def color_light_mask(crop: Image.Image) -> Image.Image:
    rgb = crop.convert("RGB")
    pixels = list(rgb.getdata())
    raw = []
    for red, green, blue in pixels:
        brightness = max(red, green, blue)
        cyan_delta = max(blue - red, green - red)
        red_delta = red - green
        cyan = min(255, cyan_delta * 5) if brightness > 58 and cyan_delta > 16 else 0
        hostile = min(255, red_delta * 5) if brightness > 48 and red_delta > 16 else 0
        raw.append(min(255, max(cyan, hostile)))
    mask = Image.new("L", rgb.size)
    mask.putdata(raw)
    mask = mask.point(lambda value: 255 if value > 8 else 0)
    mask = mask.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(7))
    soft_center = Image.new("L", crop.size, 0)
    inset = max(5, min(crop.size) // 20)
    ImageDraw.Draw(soft_center).ellipse(
        (inset, inset, crop.width - inset, crop.height - inset), fill=255
    )
    soft_center = soft_center.filter(ImageFilter.GaussianBlur(max(10, min(crop.size) // 10)))
    return ImageChops.lighter(mask, soft_center)


def dark_glass_color(crop: Image.Image) -> tuple[int, int, int, int]:
    candidates = []
    for pixel in crop.convert("RGB").getdata():
        if max(pixel) < 42:
            candidates.append(pixel)
    if not candidates:
        return (2, 8, 12, 255)
    stat = ImageStat.Stat(Image.new("RGB", (len(candidates), 1)) if False else crop.convert("RGB"))
    ordered = list(zip(*candidates))
    return tuple(sorted(channel)[len(channel) // 2] for channel in ordered) + (255,)


for ship, spec in SHIPS.items():
    source = Image.open(ASSETS / spec["source"]).convert("RGBA")
    clean = source.copy()
    illumination = Image.new("RGBA", source.size, (0, 0, 0, 0))

    for suit, box in spec["suits"].items():
        original_crop = source.crop(box)
        mask = color_light_mask(original_crop)
        dark = Image.new("RGBA", original_crop.size, dark_glass_color(original_crop))
        clean_crop = Image.composite(dark, original_crop, mask)
        clean.paste(clean_crop, box)

        delta = ImageChops.difference(original_crop, clean_crop).convert("RGB")
        delta_mask = delta.convert("L").point(lambda value: min(255, value * 4))
        suit_layer = original_crop.copy()
        suit_layer.putalpha(delta_mask)
        illumination.alpha_composite(suit_layer, (box[0], box[1]))

    clean.save(ASSETS / f"dashboard-{ship}-layered-base-v1.png")
    illumination.save(ASSETS / f"dashboard-{ship}-suit-lights-v1.png")

    layout = {
        "ship": ship,
        "nativeSize": {"width": source.width, "height": source.height},
        "suits": {
            suit: {"x": values[0], "y": values[1], "width": values[2], "height": values[3]}
            for suit, values in spec["hits"].items()
        },
    }
    (ASSETS / f"dashboard-{ship}-layout-v1.json").write_text(json.dumps(layout, indent=2), encoding="utf-8")
