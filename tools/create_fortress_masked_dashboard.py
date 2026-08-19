from PIL import Image, ImageDraw


SOURCE = "outputs/card-fortress-prototype/assets/dashboard-fortress-fullwidth-v2.png"
TARGET = "outputs/card-fortress-prototype/assets/dashboard-fortress-fullwidth-masked-v2.png"


image = Image.open(SOURCE).convert("RGBA")
draw = ImageDraw.Draw(image, "RGBA")

# These polygons are traced from the inner black-glass edges in the 1870 x 841
# source artwork. They intentionally do not overlap any of the metal bezel.
glass_windows = (
    ((1193, 263), (1395, 263), (1429, 297), (1429, 427), (1395, 457), (1190, 457), (1159, 424), (1159, 299)),
    ((1520, 263), (1720, 263), (1753, 297), (1753, 427), (1720, 457), (1518, 457), (1486, 424), (1486, 299)),
    ((1192, 525), (1395, 525), (1429, 559), (1429, 687), (1395, 717), (1190, 717), (1159, 684), (1159, 561)),
    ((1519, 525), (1720, 525), (1753, 559), (1753, 687), (1720, 717), (1518, 717), (1486, 684), (1486, 561)),
)

for polygon in glass_windows:
    draw.polygon(polygon, fill=(1, 7, 11, 255))

image.save(TARGET)
