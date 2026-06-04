Hooks.on("init", () => {
    // Override map notes to use the BackgroundlessControlIcon
    foundry.canvas.placeables.Note.prototype._drawControlIcon = function () {
        const iconData = {
            texture: this.document.texture.src,
            size: this.document.iconSize,
            tint: Color.from(this.document.texture.tint || null)
        };
        const icon = new foundry.canvas.containers.ControlIcon(iconData);

        const hasBackground = this.document.getFlag("backgroundless-pins", "hasBackground");
        icon.bg.alpha = hasBackground ? 0.4 : 0;
        icon.border.alpha = hasBackground ? 1 : 0;
        return icon;
    };
});

Hooks.on("hoverNote", (note, hover) => {
    const hasBackground = note.document.getFlag("backgroundless-pins", "hasBackground");
    if (!hasBackground) {
        note.controlIcon.border.alpha = hover ? 1 : 0;
    }
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
