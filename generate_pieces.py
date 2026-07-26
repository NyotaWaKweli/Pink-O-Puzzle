from PIL import Image, ImageDraw
import math

size = 800
bg = '#FFFFFF'
pink = '#EB7EFB'
black = '#1E1B21'


def make_bishop(color, path):
	img = Image.new('RGB', (size, size), color=bg)
	draw = ImageDraw.Draw(img)
	cx, cy = 400, 350
	arm_len = 220
	bar_width = 55
	hw = bar_width // 2

	# Bar 1: top-left to bottom-right
	x1, y1 = cx - arm_len, cy - arm_len
	x2, y2 = cx + arm_len, cy + arm_len
	dx, dy = x2 - x1, y2 - y1
	L = math.sqrt(dx**2 + dy**2)
	ux, uy = dx / L, dy / L
	ox, oy = int(uy * hw), int(-ux * hw)
	bar1 = [(x1 + ox, y1 + oy), (x1 - ox, y1 - oy), (x2 - ox, y2 - oy), (x2 + ox, y2 + oy)]

	# Bar 2: top-right to bottom-left
	x1, y1 = cx + arm_len, cy - arm_len
	x2, y2 = cx - arm_len, cy + arm_len
	dx, dy = x2 - x1, y2 - y1
	L = math.sqrt(dx**2 + dy**2)
	ux, uy = dx / L, dy / L
	ox, oy = int(uy * hw), int(-ux * hw)
	bar2 = [(x1 + ox, y1 + oy), (x1 - ox, y1 - oy), (x2 - ox, y2 - oy), (x2 + ox, y2 + oy)]

	draw.polygon(bar1, fill=color)
	draw.polygon(bar2, fill=color)
	img.save(path, 'PNG')


def make_king(color, path):
	img = Image.new('RGB', (size, size), color=bg)
	draw = ImageDraw.Draw(img)
	cx, cy = 400, 350
	r = 220
	pts = []
	for i in range(8):
		a = math.radians(22.5 + i * 45)
		pts.append((int(cx + r * math.cos(a)), int(cy + r * math.sin(a))))
	draw.polygon(pts, fill=color)
	img.save(path, 'PNG')


def make_rook(color, path):
	img = Image.new('RGB', (size, size), color=bg)
	draw = ImageDraw.Draw(img)
	s = 220
	draw.polygon([(400 - s, 350 - s), (400 + s, 350 - s),
				  (400 + s, 350 + s), (400 - s, 350 + s)], fill=color)
	img.save(path, 'PNG')


def make_pawn(color, path):
	img = Image.new('RGB', (size, size), color=bg)
	draw = ImageDraw.Draw(img)
	draw.polygon([(320, 180), (480, 180), (540, 520), (260, 520)], fill=color)
	img.save(path, 'PNG')


def make_knight(color, path):
	img = Image.new('RGB', (size, size), color=bg)
	draw = ImageDraw.Draw(img)
	cx, cy = 400, 350
	stem_len = 90
	stem_w = 28
	cross_len = 90
	cross_w = 28
	hsw = stem_w // 2
	hcw = cross_w // 2
	hcl = cross_len // 2

	# North T
	draw.polygon([(cx - hsw, cy), (cx + hsw, cy),
				  (cx + hsw, cy - stem_len), (cx - hsw, cy - stem_len)], fill=color)
	draw.polygon([(cx - hcl, cy - stem_len - hcw), (cx + hcl, cy - stem_len - hcw),
				  (cx + hcl, cy - stem_len + hcw), (cx - hcl, cy - stem_len + hcw)], fill=color)

	# South T
	draw.polygon([(cx - hsw, cy), (cx + hsw, cy),
				  (cx + hsw, cy + stem_len), (cx - hsw, cy + stem_len)], fill=color)
	draw.polygon([(cx - hcl, cy + stem_len - hcw), (cx + hcl, cy + stem_len - hcw),
				  (cx + hcl, cy + stem_len + hcw), (cx - hcl, cy + stem_len + hcw)], fill=color)

	# East T
	draw.polygon([(cx, cy - hsw), (cx, cy + hsw),
				  (cx + stem_len, cy + hsw), (cx + stem_len, cy - hsw)], fill=color)
	draw.polygon([(cx + stem_len - hcw, cy - hcl), (cx + stem_len + hcw, cy - hcl),
				  (cx + stem_len + hcw, cy + hcl), (cx + stem_len - hcw, cy + hcl)], fill=color)

	# West T
	draw.polygon([(cx, cy - hsw), (cx, cy + hsw),
				  (cx - stem_len, cy + hsw), (cx - stem_len, cy - hsw)], fill=color)
	draw.polygon([(cx - stem_len - hcw, cy - hcl), (cx - stem_len + hcw, cy - hcl),
				  (cx - stem_len + hcw, cy + hcl), (cx - stem_len - hcw, cy + hcl)], fill=color)

	img.save(path, 'PNG')


def make_queen(color, path):
	img = Image.new('RGB', (size, size), color=bg)
	draw = ImageDraw.Draw(img)
	cx, cy = 400, 350
	rx, ry = 190, 170
	pts = []
	for i in range(64):
		a = math.radians(i * 360 / 64)
		pts.append((int(cx + rx * math.cos(a)), int(cy + ry * math.sin(a))))
	draw.polygon(pts, fill=color)
	img.save(path, 'PNG')


# ========== GENERATE ALL 12 IMAGES ==========

pieces = [
	('bishop', make_bishop),
	('king', make_king),
	('rook', make_rook),
	('pawn', make_pawn),
	('knight', make_knight),
	('queen', make_queen),
]

for name, func in pieces:
	func(pink, f'{name}_pink.png')
	func(black, f'{name}_black.png')
	print(f'Generated: {name}_pink.png, {name}_black.png')

print('\nAll 12 images saved!')
