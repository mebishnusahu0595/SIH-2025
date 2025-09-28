import matplotlib.pyplot as plt

palettes = {
    "Ivory + Pastel Blue": ["#FFFFF0", "#A7C7E7"],
    "Ivory + Sage Green": ["#FFFFF0", "#BFD8B8"],
    "Ivory + Blush Pink": ["#FFFFF0", "#F7CACA"]
}


fig, axes = plt.subplots(1, len(palettes), figsize=(12, 3))

for ax, (name, colors) in zip(axes, palettes.items()):
    for i, color in enumerate(colors):
        ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=color))
    ax.set_xlim(0, len(colors))
    ax.set_ylim(0, 1)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title(name, fontsize=10)

plt.tight_layout()
plt.show()


# D667B7