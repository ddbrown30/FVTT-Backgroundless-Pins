Hooks.on("init", () => {
    // Override map notes to use the BackgroundlessControlIcon
    foundry.canvas.placeables.Note.prototype._drawControlIcon = function () {
        const iconData = {
            texture: this.document.texture.src,
            size: this.document.iconSize,
            tint: Color.from(this.document.texture.tint || null)
        };
        const hasBackground = this.document.getFlag(
            "backgroundless-pins",
            "hasBackground"
        );
        const IconClass = hasBackground
            ? foundry.canvas.containers.ControlIcon
            : BackgroundlessControlIcon;
        const icon = new IconClass(iconData);
        const halfIconSize = this.document.iconSize / 2;
        icon.x -= halfIconSize;
        icon.y -=halfIconSize;
        return icon;
    };
});

Hooks.on("renderNoteConfig", (noteConfig, html, data, options) => {
    const hasBackground = noteConfig.document.getFlag("backgroundless-pins", "hasBackground") ?? false;
    const iconTintGroup = html.querySelector("[name='texture.tint']").closest(".form-group");

    const bgOption = document.createElement("div");
    bgOption.classList.add("form-group");
    bgOption.innerHTML = `
        <label for="flags.backgroundless-pins.hasBackground">Show Background?</label>
        <div class="form-fields"><input type="checkbox" name="flags.backgroundless-pins.hasBackground" data-dtype="Boolean" ${hasBackground ? "checked" : ""}></div>
        `;

    iconTintGroup.parentElement.appendChild(bgOption);

    noteConfig.setPosition({ height: "auto" });
});

Hooks.on("closeNoteConfig", (noteConfig) => {
    //There seems to be no way to trigger the draw as part of changing the hasBackground value so we just do it here every time
    noteConfig.document.object.draw({force: true});
});

export class BackgroundlessControlIcon extends foundry.canvas.containers.ControlIcon {
    /**
     * Override ControlIcon#draw to remove drawing of the background.
     */
    async draw() {
        // Don't draw a destroyed Control
        if (this.destroyed) return this;

        // Load the icon texture
        this.texture = this.texture ?? await foundry.canvas.loadTexture(this.iconSrc);

        // Set the icon texture
        this.icon.texture = this.texture;

        // Set the icon width and height
        this.icon.width = this.icon.height = this.size;

        // Hide the background
        this.bg.visible = false;

        // Refresh
        return this.refresh();
    }
}
