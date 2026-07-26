from PIL import Image, ImageDraw, ImageFilter
import math
import os

# Create pieces folder
if not os.path.exists('pieces'):
    os.makedirs('pieces')

size = 400
pink_base = '#EB7EFB'
black_base = '#1E1B21'

# Color palettes for 3D effect
def get_colors(is_white):
    if is_white:
        return {
            'base': '#EB7EFB',
            'light': '#F8B4FF',
            'dark': '#D05CE8',
            'highlight': '#FFD4FF',
            'shadow': '#B84AC8',
            'edge': '#A840B8'
        }
    else:
        return {
            'base': '#1E1B21',
            'light': '#3A3540',
            'dark': '#0D0B0E',
            'highlight': '#4A4550',
            'shadow': '#050405',
            'edge': '#2A2530'
        }


def add_3d_depth(draw, points, colors, width=3):
    """Draw a polygon with 3D depth effect"""
    # Draw shadow (slightly offset)
    shadow_points = [(x + 4, y + 4) for x, y in points]
    draw.polygon(shadow_points, fill=colors['shadow'])
    # Draw main shape
    draw.polygon(points, fill=colors['base'], outline=colors['edge'], width=width)
    # Draw highlight (top-left portion)
    if len(points) >= 3:
        highlight_points = points[:3]
        # Shift highlight slightly
        hl_points = [(x - 2, y - 2) for x, y in highlight_points]
        draw.polygon(hl_points, fill=colors['highlight'])


def make_bishop(color, path, is_white=True):
    colors = get_colors(is_white)
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    
    # Your original bishop design - X shape with rounded edges
    arm_len = 150
    bar_width = 45
    hw = bar_width // 2
    radius = 15  # Rounded corners

    # Bar 1: top-left to bottom-right (with rounded corners)
    x1, y1 = cx - arm_len, cy - arm_len
    x2, y2 = cx + arm_len, cy + arm_len
    dx, dy = x2 - x1, y2 - y1
    L = math.sqrt(dx**2 + dy**2)
    ux, uy = dx / L, dy / L
    ox, oy = int(uy * hw), int(-ux * hw)
    
    # Create rounded rectangle bar
    bar1_points = [
        (x1 + ox, y1 + oy),
        (x1 - ox, y1 - oy),
        (x2 - ox, y2 - oy),
        (x2 + ox, y2 + oy)
    ]
    # Draw with 3D effect
    add_3d_depth(draw, bar1_points, colors, 3)

    # Bar 2: top-right to bottom-left
    x1, y1 = cx + arm_len, cy - arm_len
    x2, y2 = cx - arm_len, cy + arm_len
    dx, dy = x2 - x1, y2 - y1
    L = math.sqrt(dx**2 + dy**2)
    ux, uy = dx / L, dy / L
    ox, oy = int(uy * hw), int(-ux * hw)
    
    bar2_points = [
        (x1 + ox, y1 + oy),
        (x1 - ox, y1 - oy),
        (x2 - ox, y2 - oy),
        (x2 + ox, y2 + oy)
    ]
    add_3d_depth(draw, bar2_points, colors, 3)
    
    # Add center glow
    draw.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], 
                 fill=colors['highlight'], outline=None)
    
    # Add subtle gradient overlay
    gradient = Image.new('RGBA', img.size, (255, 255, 255, 0))
    grad_draw = ImageDraw.Draw(gradient)
    for i in range(50):
        alpha = int(3 * (1 - i/50))
        grad_draw.ellipse([cx - 100 + i, cy - 100 + i, cx + 100 - i, cy + 100 - i], 
                          fill=(255, 255, 255, alpha))
    img = Image.alpha_composite(img, gradient)
    
    img.save(path, 'PNG')
    print(f'✅ Saved: {path}')


def make_king(color, path, is_white=True):
    colors = get_colors(is_white)
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    r = 160
    
    # Your original king design - octagon with 3D effect
    pts = []
    for i in range(8):
        a = math.radians(22.5 + i * 45)
        pts.append((int(cx + r * math.cos(a)), int(cy + r * math.sin(a))))
    
    # Draw shadow
    shadow_pts = [(x + 5, y + 5) for x, y in pts]
    draw.polygon(shadow_pts, fill=colors['shadow'])
    
    # Draw main octagon
    draw.polygon(pts, fill=colors['base'], outline=colors['edge'], width=4)
    
    # Draw inner glow
    inner_r = int(r * 0.7)
    inner_pts = []
    for i in range(8):
        a = math.radians(22.5 + i * 45)
        inner_pts.append((int(cx + inner_r * math.cos(a)), int(cy + inner_r * math.sin(a))))
    draw.polygon(inner_pts, fill=colors['highlight'], outline=None)
    
    # Add top highlight
    highlight_pts = []
    for i in range(3):
        a = math.radians(22.5 + i * 45)
        highlight_pts.append((int(cx + (r - 10) * math.cos(a)), int(cy + (r - 10) * math.sin(a))))
    draw.polygon(highlight_pts, fill=(255, 255, 255, 40), outline=None)
    
    img.save(path, 'PNG')
    print(f'✅ Saved: {path}')


def make_rook(color, path, is_white=True):
    colors = get_colors(is_white)
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    s = 160
    
    # Your original rook design - square with 3D effect
    square_pts = [
        (cx - s, cy - s),
        (cx + s, cy - s),
        (cx + s, cy + s),
        (cx - s, cy + s)
    ]
    
    # Draw shadow
    shadow_pts = [(x + 5, y + 5) for x, y in square_pts]
    draw.polygon(shadow_pts, fill=colors['shadow'])
    
    # Draw main square with rounded corners
    draw.rounded_rectangle([cx - s, cy - s, cx + s, cy + s], 
                           radius=15, fill=colors['base'], outline=colors['edge'], width=4)
    
    # Draw inner highlight square
    draw.rounded_rectangle([cx - s + 20, cy - s + 20, cx + s - 20, cy + s - 20], 
                           radius=10, fill=colors['highlight'], outline=None)
    
    # Add top-left brightness
    draw.rounded_rectangle([cx - s + 5, cy - s + 5, cx - s + 40, cy - s + 40], 
                           radius=8, fill=(255, 255, 255, 30), outline=None)
    
    img.save(path, 'PNG')
    print(f'✅ Saved: {path}')


def make_pawn(color, path, is_white=True):
    colors = get_colors(is_white)
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    
    # Your original pawn design - trapezoid with 3D effect
    pawn_pts = [
        (cx - 80, cy - 70),
        (cx + 80, cy - 70),
        (cx + 110, cy + 70),
        (cx - 110, cy + 70)
    ]
    
    # Draw shadow
    shadow_pts = [(x + 5, y + 5) for x, y in pawn_pts]
    draw.polygon(shadow_pts, fill=colors['shadow'])
    
    # Draw main trapezoid with rounded corners
    draw.polygon(pawn_pts, fill=colors['base'], outline=colors['edge'], width=4)
    
    # Draw inner highlight
    inner_pts = [
        (cx - 60, cy - 50),
        (cx + 60, cy - 50),
        (cx + 85, cy + 50),
        (cx - 85, cy + 50)
    ]
    draw.polygon(inner_pts, fill=colors['highlight'], outline=None)
    
    # Add top oval glow
    draw.ellipse([cx - 40, cy - 90, cx + 40, cy - 50], 
                 fill=colors['highlight'], outline=None)
    
    img.save(path, 'PNG')
    print(f'✅ Saved: {path}')


def make_knight(color, path, is_white=True):
    colors = get_colors(is_white)
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    
    # Your original knight design - T shape with 3D effect
    stem_len = 80
    stem_w = 35
    cross_len = 80
    cross_w = 35
    hsw = stem_w // 2
    hcw = cross_w // 2
    hcl = cross_len // 2

    # All T shapes with 3D effect
    shapes = [
        # North T
        [(cx - hsw, cy), (cx + hsw, cy),
         (cx + hsw, cy - stem_len), (cx - hsw, cy - stem_len)],
        [(cx - hcl, cy - stem_len - hcw), (cx + hcl, cy - stem_len - hcw),
         (cx + hcl, cy - stem_len + hcw), (cx - hcl, cy - stem_len + hcw)],
        
        # South T
        [(cx - hsw, cy), (cx + hsw, cy),
         (cx + hsw, cy + stem_len), (cx - hsw, cy + stem_len)],
        [(cx - hcl, cy + stem_len - hcw), (cx + hcl, cy + stem_len - hcw),
         (cx + hcl, cy + stem_len + hcw), (cx - hcl, cy + stem_len + hcw)],
        
        # East T
        [(cx, cy - hsw), (cx, cy + hsw),
         (cx + stem_len, cy + hsw), (cx + stem_len, cy - hsw)],
        [(cx + stem_len - hcw, cy - hcl), (cx + stem_len + hcw, cy - hcl),
         (cx + stem_len + hcw, cy + hcl), (cx + stem_len - hcw, cy + hcl)],
        
        # West T
        [(cx, cy - hsw), (cx, cy + hsw),
         (cx - stem_len, cy + hsw), (cx - stem_len, cy - hsw)],
        [(cx - stem_len - hcw, cy - hcl), (cx - stem_len + hcw, cy - hcl),
         (cx - stem_len + hcw, cy + hcl), (cx - stem_len - hcw, cy + hcl)]
    ]

    for shape_pts in shapes:
        # Shadow
        shadow_pts = [(x + 4, y + 4) for x, y in shape_pts]
        draw.polygon(shadow_pts, fill=colors['shadow'])
        # Main shape with rounded corners
        draw.polygon(shape_pts, fill=colors['base'], outline=colors['edge'], width=3)
        # Highlight (top-left portion)
        if len(shape_pts) >= 3:
            hl_pts = shape_pts[:3]
            hl_pts = [(x - 2, y - 2) for x, y in hl_pts]
            draw.polygon(hl_pts, fill=colors['highlight'])

    # Center glow
    draw.ellipse([cx - 15, cy - 15, cx + 15, cy + 15], 
                 fill=colors['highlight'], outline=None)
    
    img.save(path, 'PNG')
    print(f'✅ Saved: {path}')


def make_queen(color, path, is_white=True):
    colors = get_colors(is_white)
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    rx, ry = 170, 150
    
    # Your original queen design - ellipse with 3D effect
    pts = []
    for i in range(64):
        a = math.radians(i * 360 / 64)
        pts.append((int(cx + rx * math.cos(a)), int(cy + ry * math.sin(a))))
    
    # Draw shadow
    shadow_pts = [(x + 5, y + 5) for x, y in pts]
    draw.polygon(shadow_pts, fill=colors['shadow'])
    
    # Draw main ellipse
    draw.polygon(pts, fill=colors['base'], outline=colors['edge'], width=4)
    
    # Draw inner glow
    inner_rx, inner_ry = int(rx * 0.7), int(ry * 0.7)
    inner_pts = []
    for i in range(64):
        a = math.radians(i * 360 / 64)
        inner_pts.append((int(cx + inner_rx * math.cos(a)), int(cy + inner_ry * math.sin(a))))
    draw.polygon(inner_pts, fill=colors['highlight'], outline=None)
    
    # Add crown points on top
    for i in range(7):
        angle = math.radians(-90 + i * 30)
        x = int(cx + (rx + 15) * math.cos(angle))
        y = int(cy + (ry + 15) * math.sin(angle))
        draw.ellipse([x - 10, y - 10, x + 10, y + 10], 
                     fill=colors['highlight'], outline=colors['edge'], width=2)
    
    img.save(path, 'PNG')
    print(f'✅ Saved: {path}')


# ========== GENERATE ALL 12 IMAGES ==========

pieces = [
    ('pawn', make_pawn),
    ('rook', make_rook),
    ('knight', make_knight),
    ('bishop', make_bishop),
    ('queen', make_queen),
    ('king', make_king),
]

print('🎨 Enhancing your geometric chess pieces with 3D effects...\n')

for name, func in pieces:
    func(pink_base, f'pieces/{name}_pink.png', True)
    func(black_base, f'pieces/{name}_black.png', False)

print('\n✅ All 12 images saved in the "pieces" folder!')
print('📁 Folder structure:')
print('   pieces/')
print('   ├── pawn_pink.png    ├── pawn_black.png')
print('   ├── rook_pink.png    ├── rook_black.png')
print('   ├── knight_pink.png  ├── knight_black.png')
print('   ├── bishop_pink.png  ├── bishop_black.png')
print('   ├── queen_pink.png   ├── queen_black.png')
print('   └── king_pink.png    └── king_black.png')
print('\n✨ Each geometric shape now has:')
print('   • 3D depth with shadows')
print('   • Gradient-like highlights')
print('   • Rounded and polished edges')
print('   • Professional game aesthetic')
