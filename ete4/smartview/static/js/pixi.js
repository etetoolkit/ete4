// Functions related to drawing raster graphics with pixi.

import { Application, Sprite, Assets, Container } from '../external/pixi.min.mjs';

import { view } from "./gui.js";

export { init_pixi, create_seq_pixi_local, clear_pixi };


async function init_pixi() {
    // The application creates a WebGL renderer, or canvas if not possible.
    view.pixi_app_tree = new Application();
    view.pixi_app_aligned = new Application();

    await view.pixi_app_tree.init({  // wait for the renderer to be available
        backgroundAlpha: 0,  // transparent background so we see the tree
        resizeTo: div_tree,  // resize with div_tree
    });

    // If we don't make div_aligned visible, it won't resize properly
   div_aligned.style.display = "flex";

    await view.pixi_app_aligned.init({  // wait for the renderer to be available
        backgroundAlpha: 0,  // transparent background so we see the tree
        resizeTo: div_aligned,  // resize with div_aligned
    });

    div_aligned.style.display = "none";  // now we can make it invisible

    // We set the style of the pixi canvas so it is superimposed to the div.
    for (const app of [view.pixi_app_tree, view.pixi_app_aligned]) {
        const style = app.canvas.style;
        style.position = "absolute";
        style.top = "0";
        style.left = "0";
        style.zIndex = "1";  // make sure we are above the svg panel
        style.pointerEvents = "none";
    }

    // Insert canvases in the dom.
    div_tree.appendChild(view.pixi_app_tree.canvas);
    div_aligned.appendChild(view.pixi_app_aligned.canvas);

    view.pixi_sheet = await Assets.load('/static/images/spritesheet.json');
}


// Return a pixi container with an image for the sequence in box
// (in local coordinates).
function create_seq_pixi_local(seq, box, wmax) {
    const container = new Container();

    // TODO: Merge most of this code with the one in draw.js
    const [x0, y0, dx0, dy0] = box;
    const dx = dx0 / seq.length;

    const [xmin, xmax] = [0, wmax];
    const imin = Math.max(0,          Math.floor((xmin - x0) / dx));
    const imax = Math.min(seq.length, Math.ceil( (xmax - x0) / dx));

    const [y, dy] = pad(y0, dy0, view.array.padding);

    for (let i = imin, x = x0 + imin * dx; i < imax; i++, x+=dx)
        container.addChild(create_char(seq[i], [x, y, dx, dy]));

    return container;
}

// Transform the interval [y0, y0+dy0] into one padded with the given fraction.
function pad(y0, dy0, fraction) {
    const dy = dy0 * (1 - fraction);
    return [y0 + (dy0 - dy)/2, dy]
}
// TODO: Merge this code with the one in draw.js


// Return a new sprite with the given character situated in the given box.
function create_char(char, box) {
    const sprite = new Sprite(view.pixi_sheet.textures[char]);
    const [x, y, w, h] = box;

    sprite.x = x;
    sprite.y = y;
    sprite.setSize(w, h);

    return sprite;
}


// Clear the canvas by removing all the sprites.
function clear_pixi() {
    // NOTE: After heavy testing with/without this -> use to avoid memory leaks.
    view.pixi_app_tree.stage.children.forEach(c => c.destroy({children: true}));
    view.pixi_app_aligned.stage.children.forEach(c => c.destroy({children: true}));

    // The normal removal of everything.
    view.pixi_app_tree.stage.removeChildren();
    view.pixi_app_aligned.stage.removeChildren();
}
