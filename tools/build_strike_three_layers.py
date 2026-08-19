from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path("outputs/card-fortress-prototype/assets")
SOURCE = ROOT / "dashboard-strike-fullwidth-v2.png"

# Broad search regions around the four Strike suit displays. The final glass
# boundary is discovered from the source pixels inside each region.
WINDOWS = {
    "clubs": (1550, 220, 1800, 465),
    "hearts": (1780, 220, 2050, 465),
    "spades": (1580, 455, 1845, 715),
    "diamonds": (1810, 455, 2052, 715),
}


def dark_component_mask(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    crop = image.crop(box).convert("RGB")
    width, height = crop.size
    pixels = crop.load()
    # Do not seed at the center: the hollow center of a suit can be enclosed by
    # its bright outline. Seed in the upper-left glass field instead.
    seed = (width // 4, height // 4)
    queue = deque([seed])
    visited = {seed}
    component = set()

    while queue:
        x, y = queue.popleft()
        red, green, blue = pixels[x, y]
        # Dark smoked glass is separated from the metal by a continuous bright
        # inner bevel. Colored suit pixels become holes and are filled below.
        if max(red, green, blue) > 72:
            continue
        component.add((x, y))
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))

    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    # Every suit window is convex. Filling each scanline between the component
    # extremes restores the holes made by the illuminated symbol without ever
    # crossing the detected metal boundary.
    rows: dict[int, list[int]] = {}
    for x, y in component:
        rows.setdefault(y, []).append(x)
    for y, xs in rows.items():
        if len(xs) > 8:
            draw.line((min(xs), y, max(xs), y), fill=255)
    return mask


source = Image.open(SOURCE).convert("RGBA")
frame = source.copy()
glass = Image.new("RGBA", source.size, (0, 0, 0, 0))
lights = Image.new("RGBA", source.size, (0, 0, 0, 0))

for suit, box in WINDOWS.items():
    local_mask = dark_component_mask(source, box)
    global_mask = Image.new("L", source.size, 0)
    global_mask.paste(local_mask, (box[0], box[1]))

    # The frame is the untouched original dashboard with only the detected
    # glass pixels made transparent. All bezel pixels remain original pixels.
    frame_alpha = frame.getchannel("A")
    frame_alpha = Image.composite(Image.new("L", source.size, 0), frame_alpha, global_mask)
    frame.putalpha(frame_alpha)

    # Ready state uses the exact original interior pixels.
    original_interior = source.copy()
    original_interior.putalpha(global_mask)
    lights.alpha_composite(original_interior)

    # Locked state is a subtle smoked-glass gradient clipped by the very same
    # source-derived mask. It lives behind the metal frame.
    crop = source.crop(box).convert("RGB")
    dark_pixels = [pixel for pixel in crop.getdata() if max(pixel) < 38]
    if dark_pixels:
        channels = list(zip(*dark_pixels))
        median = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    else:
        median = (2, 8, 12)
    pane = Image.new("RGBA", source.size, median + (255,))
    pane_alpha = global_mask.filter(ImageFilter.GaussianBlur(0.35))
    pane.putalpha(pane_alpha)
    glass.alpha_composite(pane)

frame.save(ROOT / "dashboard-strike-frame-v1.png")
glass.save(ROOT / "dashboard-strike-glass-v1.png")
lights.save(ROOT / "dashboard-strike-illuminated-interiors-v1.png")

# Verification renders are not used by the game.
locked = Image.alpha_composite(glass, frame)
ready = Image.alpha_composite(Image.alpha_composite(glass, lights), frame)
locked.save(ROOT / "dashboard-strike-three-layer-locked-check-v1.png")
ready.save(ROOT / "dashboard-strike-three-layer-ready-check-v1.png")
