"""
Generate brand-coloured diagrams for the ebook, embedded as real PNG figures.
Brand palette (CLAUDE.md / brand-identity memory):
  True Blue #0073CF · Lime Green #32CD32 · Golden Poppy #FCC200
Run: python ebook/figures.py  ->  writes ebook/figures/*.png
"""
import os
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

BLUE = "#0073CF"
LIME = "#32CD32"
POPPY = "#FCC200"
INK = "#0B1B2B"
SLATE = "#445566"
PAPER = "#FFFFFF"
MIST = "#EEF3F8"

OUT = os.path.join(os.path.dirname(__file__), "figures")
os.makedirs(OUT, exist_ok=True)

plt.rcParams["font.family"] = "DejaVu Sans"


def box(ax, x, y, w, h, text, fc=PAPER, ec=BLUE, tc=INK, fs=11, bold=False, lw=2.2, rad=0.06):
    p = FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0.02,rounding_size={rad}",
        linewidth=lw, edgecolor=ec, facecolor=fc, mutation_aspect=1,
    )
    ax.add_patch(p)
    ax.text(
        x + w / 2, y + h / 2, text, ha="center", va="center",
        fontsize=fs, color=tc, fontweight="bold" if bold else "normal", wrap=True,
    )


def arrow(ax, x1, y1, x2, y2, color=SLATE, lw=2.2, style="-|>"):
    ax.add_patch(FancyArrowPatch(
        (x1, y1), (x2, y2), arrowstyle=style, mutation_scale=18,
        linewidth=lw, color=color, shrinkA=2, shrinkB=2,
    ))


def canvas(w=11, h=7):
    fig, ax = plt.subplots(figsize=(w, h), dpi=170)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    return fig, ax


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), bbox_inches="tight", facecolor=PAPER, pad_inches=0.25)
    plt.close(fig)
    print("wrote", name)


# ── Figure: Two readers ──────────────────────────────────────────────────────
def fig_two_readers():
    fig, ax = canvas(11, 6)
    ax.text(50, 94, "Every page is read by TWO readers", ha="center", fontsize=17, fontweight="bold", color=INK)
    box(ax, 6, 55, 30, 24, "THE HUMAN\nJudges in ~50 ms\nWants: beautiful,\ntrustworthy, clear", fc=MIST, ec=BLUE, fs=12, bold=True)
    box(ax, 64, 55, 30, 24, "THE MACHINE\nAI engines & crawlers\nWants: clean, readable\nHTML it can cite", fc=MIST, ec=LIME, fs=12, bold=True)
    box(ax, 30, 18, 40, 20, "ONE SOURCE OF TRUTH\nServer-rendered\nsemantic HTML", fc=PAPER, ec=POPPY, fs=13, bold=True, lw=3)
    arrow(ax, 21, 55, 42, 38, color=BLUE)
    arrow(ax, 79, 55, 58, 38, color=LIME)
    ax.text(50, 6, "Beauty is layered on top of that foundation — never instead of it.",
            ha="center", fontsize=11, color=SLATE, style="italic")
    save(fig, "fig_two_readers.png")


# ── Figure: Code vs CMS ──────────────────────────────────────────────────────
def fig_cms_model():
    fig, ax = canvas(11, 6)
    ax.text(50, 94, "Who owns what: Code vs. the CMS", ha="center", fontsize=17, fontweight="bold", color=INK)
    box(ax, 5, 30, 41, 52,
        "CODE  (developers)\n\n• The engine (Next.js)\n• The design system\n• The TYPES of blocks\n• New functionality",
        fc=MIST, ec=BLUE, fs=12, bold=False)
    ax.text(25.5, 84, "Rarely changes", ha="center", fontsize=10, color=BLUE, fontweight="bold")
    box(ax, 54, 30, 41, 52,
        "CMS  (non-technical admin)\n\n• All content & images\n• Navigation menus\n• Pages & their URLs\n• Arrangement of blocks\n• Contact details & SEO text",
        fc="#F1FBEF", ec=LIME, fs=12, bold=False)
    ax.text(74.5, 84, "Changes every day — no code, no deploy", ha="center", fontsize=10, color=LIME, fontweight="bold")
    ax.text(50, 16, "Adding a page, a menu tab, or a block never requires a developer.",
            ha="center", fontsize=11, color=SLATE, style="italic")
    save(fig, "fig_cms_model.png")


# ── Figure: Quality loop ─────────────────────────────────────────────────────
def fig_quality_loop():
    fig, ax = canvas(11, 5.2)
    ax.text(50, 92, "The discipline: a loop that never ships broken work", ha="center", fontsize=16, fontweight="bold", color=INK)
    steps = ["Write", "Type-\ncheck", "Lint", "Format", "Test", "Build"]
    colors = [BLUE, BLUE, BLUE, BLUE, LIME, POPPY]
    x = 4
    w = 13.5
    gap = 1.7
    y = 45
    for i, (s, c) in enumerate(zip(steps, colors)):
        box(ax, x, y, w, 22, s, fc=PAPER, ec=c, fs=12, bold=True)
        if i < len(steps) - 1:
            arrow(ax, x + w, y + 11, x + w + gap, y + 11, color=SLATE)
        x += w + gap
    arrow(ax, x - gap, y, 50, 20, color="#B00020", lw=2.2, style="-|>")
    ax.text(50, 14, "Any failure → fix → repeat. Only a fully green run counts as 'done'.",
            ha="center", fontsize=11, color=SLATE, style="italic")
    save(fig, "fig_quality_loop.png")


# ── Figure: System architecture ──────────────────────────────────────────────
def fig_architecture():
    fig, ax = canvas(11, 7.3)
    ax.text(50, 96, "How the whole system fits together", ha="center", fontsize=17, fontweight="bold", color=INK)
    box(ax, 38, 82, 24, 11, "Visitor's\nbrowser", fc=MIST, ec=BLUE, fs=12, bold=True)
    box(ax, 26, 52, 48, 20, "THE WEBSITE  (Next.js on the VPS)\nPublic pages  ·  /admin (Payload CMS)\n/api/chat proxy", fc=PAPER, ec=BLUE, fs=12, bold=True, lw=3)
    box(ax, 30, 30, 40, 11, "PostgreSQL database\n(published content)", fc=MIST, ec=SLATE, fs=11)
    box(ax, 4, 52, 18, 20, "Hermes\nAI content\nagent (drafts)", fc="#F1FBEF", ec=LIME, fs=10, bold=True)
    box(ax, 78, 52, 18, 20, "n8n AI\nworkflow\n+ knowledge", fc="#FFF7DC", ec=POPPY, fs=10, bold=True)
    arrow(ax, 50, 82, 50, 72, color=BLUE)
    arrow(ax, 50, 52, 50, 41, color=SLATE, style="<|-|>")
    arrow(ax, 22, 60, 26, 60, color=LIME)
    arrow(ax, 74, 60, 78, 60, color=POPPY, style="<|-|>")
    box(ax, 6, 6, 88, 12, "Nginx + SSL   ·   PM2 keeps it running   ·   beta.sustechltd.com (noindex until launch)",
        fc=INK, ec=INK, tc="#FFFFFF", fs=9.5, bold=True)
    save(fig, "fig_architecture.png")


# ── Figure: Chatbot data flow ────────────────────────────────────────────────
def fig_chatbot_flow():
    fig, ax = canvas(11, 6.2)
    ax.text(50, 95, "How the AI chatbot answers (text + image)", ha="center", fontsize=16, fontweight="bold", color=INK)
    box(ax, 3, 60, 20, 22, "Visitor types a\nquestion or\nattaches a photo", fc=MIST, ec=BLUE, fs=10.5, bold=True)
    box(ax, 28, 60, 20, 22, "Brand chat widget\n(resizes image\nin the browser)", fc=PAPER, ec=BLUE, fs=10.5, bold=True)
    box(ax, 53, 60, 20, 22, "/api/chat\nsecure proxy\n(secret stays here)", fc="#FFF7DC", ec=POPPY, fs=10.5, bold=True)
    box(ax, 78, 60, 19, 22, "n8n workflow\n+ AI model\n+ your database", fc="#F1FBEF", ec=LIME, fs=10.5, bold=True)
    arrow(ax, 23, 71, 28, 71, color=SLATE)
    arrow(ax, 48, 71, 53, 71, color=SLATE)
    arrow(ax, 73, 71, 78, 71, color=SLATE)
    box(ax, 28, 26, 45, 16, "Answer returned and shown in the chat", fc=PAPER, ec=BLUE, fs=12, bold=True)
    arrow(ax, 87, 60, 73, 42, color=LIME)
    arrow(ax, 50, 60, 50, 42, color=SLATE, style="-|>")
    ax.text(50, 12, "The browser only ever talks to your own site. The secret never leaves the server.",
            ha="center", fontsize=10.5, color=SLATE, style="italic")
    save(fig, "fig_chatbot_flow.png")


# ── Figure: Publishing pipeline ──────────────────────────────────────────────
def fig_kdp_steps():
    fig, ax = canvas(11, 4.8)
    ax.text(50, 90, "From manuscript to a live Amazon listing", ha="center", fontsize=16, fontweight="bold", color=INK)
    steps = ["Manuscript\n(this file)", "Cover\ndesign", "Metadata\n& keywords", "ISBN\n(per format)", "Upload to\nKDP", "Review &\npublish"]
    colors = [BLUE, BLUE, BLUE, POPPY, BLUE, LIME]
    x = 3
    w = 14
    gap = 1.6
    y = 40
    for i, (s, c) in enumerate(zip(steps, colors)):
        box(ax, x, y, w, 24, s, fc=PAPER, ec=c, fs=10.5, bold=True)
        if i < len(steps) - 1:
            arrow(ax, x + w, y + 12, x + w + gap, y + 12, color=SLATE)
        x += w + gap
    ax.text(50, 18, "Kindle uses an ASIN (free). Each PRINT format (paperback, hardcover) needs its own ISBN.",
            ha="center", fontsize=10.5, color=SLATE, style="italic")
    save(fig, "fig_kdp_steps.png")


# ── Figure: Front cover mock ─────────────────────────────────────────────────
def fig_cover():
    fig, ax = plt.subplots(figsize=(6.25, 9.38), dpi=170)  # 2:3 ratio, KDP-friendly
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 150)
    ax.axis("off")
    ax.add_patch(FancyBboxPatch((0, 0), 100, 150, boxstyle="square,pad=0", facecolor=INK, edgecolor="none"))
    ax.add_patch(FancyBboxPatch((0, 96), 100, 54, boxstyle="square,pad=0", facecolor=BLUE, edgecolor="none"))
    ax.add_patch(FancyBboxPatch((0, 92), 100, 4, boxstyle="square,pad=0", facecolor=LIME, edgecolor="none"))
    ax.add_patch(FancyBboxPatch((0, 88), 100, 4, boxstyle="square,pad=0", facecolor=POPPY, edgecolor="none"))
    ax.text(50, 132, "BUILD A WORLD-CLASS\nWEBSITE WITH AI", ha="center", va="center",
            fontsize=21, fontweight="bold", color="#FFFFFF", linespacing=1.15)
    ax.text(50, 110, "The Non-Coder's Guide — From Idea\nto AI Chatbot, Step by Step", ha="center", va="center",
            fontsize=12, color="#EAF3FB", linespacing=1.3)
    ax.text(50, 52, "A real project, built start to finish\nwithout writing a line of code", ha="center", va="center",
            fontsize=12.5, color="#C9D6E4", linespacing=1.4, style="italic")
    ax.text(50, 14, "MD. SOHEL SIKDER", ha="center", va="center", fontsize=15, fontweight="bold", color=POPPY)
    ax.text(50, 7, "Published by Sustech Technology Ltd", ha="center", va="center", fontsize=10, color="#C9D6E4")
    fig.savefig(os.path.join(OUT, "fig_cover.png"), bbox_inches="tight", facecolor=INK, pad_inches=0)
    plt.close(fig)
    print("wrote fig_cover.png")


if __name__ == "__main__":
    fig_two_readers()
    fig_cms_model()
    fig_quality_loop()
    fig_architecture()
    fig_chatbot_flow()
    fig_kdp_steps()
    fig_cover()
    print("All figures written to", OUT)
