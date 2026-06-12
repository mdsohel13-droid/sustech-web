"""
Generate text-perfect, on-brand campaign posters (English text; add Bangla in Canva).
Brand: True Blue #0073CF · Lime Green #32CD32 · Golden Poppy #FCC200
Run: python marketing/posters.py  ->  marketing/posters/*.png
"""
import os
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

BLUE, LIME, POPPY = "#0073CF", "#32CD32", "#FCC200"
NAVY, NAVY2 = "#0B1B2B", "#13283D"
RED = "#E4572E"
WHITE, MIST = "#FFFFFF", "#C9D6E4"

OUT = os.path.join(os.path.dirname(__file__), "posters")
os.makedirs(OUT, exist_ok=True)
plt.rcParams["font.family"] = "DejaVu Sans"


def new(px_w=1080, px_h=1350):
    fig = plt.figure(figsize=(px_w / 150, px_h / 150), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100 * px_h / px_w)
    ax.axis("off")
    return fig, ax, 100 * px_h / px_w


def rrect(ax, x, y, w, h, fc, ec="none", lw=0, rad=2.2, alpha=1.0):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0,rounding_size={rad}",
                                facecolor=fc, edgecolor=ec, linewidth=lw, alpha=alpha, mutation_aspect=1))


def logo(ax, H):
    ax.text(6, H - 7, "Sustech", fontsize=20, fontweight="bold", color=WHITE, va="center")
    ax.text(26.5, H - 7, "Technology Ltd.", fontsize=12, color=MIST, va="center")
    ax.add_patch(plt.Circle((4.2, H - 7), 1.6, color=LIME))
    ax.add_patch(plt.Circle((4.2, H - 7), 0.9, color=BLUE))


def footer(ax):
    rrect(ax, 0, 0, 100, 9, NAVY2, rad=0)
    rrect(ax, 0, 8.6, 100, 0.5, LIME, rad=0)
    ax.text(50, 4.3, "+880 1722 00 21 25     www.sustechltd.com     info@sustechltd.com",
            ha="center", va="center", fontsize=10.5, color=WHITE, fontweight="bold")


# ── Poster 1: Diesel vs Lithium BESS (save-bait comparison) ──────────────────
def poster_comparison():
    fig, ax, H = new(1080, 1350)
    rrect(ax, 0, 0, 100, H, NAVY, rad=0)
    rrect(ax, 0, 0, 100, H, BLUE, rad=0, alpha=0.06)
    logo(ax, H)
    ax.text(6, H - 13.5, "SMART ENERGY  ·  STRONG ENGINEERING", fontsize=9.5, color=LIME, fontweight="bold")

    ax.text(50, H - 24, "DIESEL  vs  LITHIUM BESS", ha="center", fontsize=27, fontweight="bold", color=WHITE)
    ax.text(50, H - 30, "Which one is actually cheaper?", ha="center", fontsize=13, color=MIST, style="italic")

    # Big number
    ax.text(50, H - 45, "75%", ha="center", fontsize=64, fontweight="bold", color=POPPY)
    ax.text(50, H - 52.5, "LOWER ENERGY COST vs DIESEL", ha="center", fontsize=13, fontweight="bold", color=WHITE)

    # Comparison table
    rows = [
        ("Energy cost / kWh", "0.40 BDT", "0.10 BDT"),
        ("Efficiency", "~35%", "95%+"),
        ("Backup start", "~30 sec", "< 1 sec"),
        ("Maintenance", "High", "Negligible"),
        ("Fuel & fumes", "Yes", "Zero"),
    ]
    top = H - 60
    rh = 7.4
    xL, wL = 7, 40
    xD, wD = 49, 21
    xB, wB = 72, 21
    # headers
    ax.text(xL + 1, top + 3.4, "", fontsize=11)
    rrect(ax, xD, top, wD, 5.6, RED, rad=1.4)
    rrect(ax, xB, top, wB, 5.6, LIME, rad=1.4)
    ax.text(xD + wD / 2, top + 2.8, "DIESEL", ha="center", va="center", fontsize=12, fontweight="bold", color=WHITE)
    ax.text(xB + wB / 2, top + 2.8, "LFP BESS", ha="center", va="center", fontsize=12, fontweight="bold", color=NAVY)
    y = top - rh
    for i, (label, d, b) in enumerate(rows):
        if i % 2 == 0:
            rrect(ax, xL - 1, y - 0.4, 86, rh - 0.6, NAVY2, rad=1.2)
        ax.text(xL + 1, y + rh / 2 - 0.6, label, va="center", fontsize=12, color=WHITE, fontweight="bold")
        ax.text(xD + wD / 2, y + rh / 2 - 0.6, d, ha="center", va="center", fontsize=12.5, color="#FF9E80")
        ax.text(xB + wB / 2, y + rh / 2 - 0.6, b, ha="center", va="center", fontsize=12.5, color=LIME, fontweight="bold")
        y -= rh

    # Tagline strip
    ax.text(50, 16.5, "Solar + LFP BESS = Reliable Power, the right way.", ha="center",
            fontsize=14, fontweight="bold", color=WHITE)
    ax.text(50, 12.8, "Up to 75% savings  ·  95%+ efficiency  ·  instant backup  ·  zero fuel runs",
            ha="center", fontsize=9.8, color=MIST)
    rrect(ax, 33, 18.6, 34, 0.4, POPPY, rad=0)
    footer(ax)
    fig.savefig(os.path.join(OUT, "01_diesel_vs_bess.png"), dpi=150)
    plt.close(fig)
    print("wrote 01_diesel_vs_bess.png")


# ── Poster 2: Day-1 launch hero ──────────────────────────────────────────────
def poster_launch():
    fig, ax, H = new(1080, 1350)
    rrect(ax, 0, 0, 100, H, NAVY, rad=0)
    rrect(ax, 0, H * 0.62, 100, H * 0.38, BLUE, rad=0, alpha=0.18)
    logo(ax, H)

    ax.text(50, H - 26, "LOAD-SHEDDING?", ha="center", fontsize=34, fontweight="bold", color=WHITE)
    ax.text(50, H - 34, "Solve it the ", ha="center", fontsize=24, color=MIST)
    ax.text(50, H - 41, "RIGHT WAY.", ha="center", fontsize=34, fontweight="bold", color=POPPY)

    ax.text(50, H - 52, "Solar  +  Lithium (LFP) Battery Storage", ha="center",
            fontsize=16, fontweight="bold", color=LIME)

    # three ticks
    feats = ["Up to 75% lower energy cost", "Uninterrupted power, day & night", "AI assistant — talks Bangla, reads your bill photo"]
    y = H - 62
    for f in feats:
        ax.text(20, y, "✓", fontsize=15, color=LIME, fontweight="bold")
        ax.text(24, y, f, fontsize=12.5, color=WHITE, va="center")
        y -= 6.5

    # website badge
    rrect(ax, 24, 20, 52, 9, POPPY, rad=2.4)
    ax.text(50, 24.5, "beta.sustechltd.com", ha="center", va="center", fontsize=17, fontweight="bold", color=NAVY)
    ax.text(50, 15.5, "New AI-powered website is LIVE — explore now", ha="center", fontsize=11, color=MIST)
    footer(ax)
    fig.savefig(os.path.join(OUT, "02_launch_hero.png"), dpi=150)
    plt.close(fig)
    print("wrote 02_launch_hero.png")


if __name__ == "__main__":
    poster_comparison()
    poster_launch()
    print("Posters in", OUT)
