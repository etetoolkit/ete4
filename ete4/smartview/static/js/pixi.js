// Functions related to drawing raster graphics with pixi.

import { Application, Sprite, Assets, Container } from '../external/pixi.min.mjs';

import { view } from "./gui.js";

export { init_pixi, draw_seq, clear_pixi };


async function init_pixi() {
    // The application creates a WebGL renderer, or canvas if not possible.
    view.pixi_app = new Application();

    // If we don't make div_aligned visible, it won't resize properly
   div_aligned.style.display = "flex";

    await view.pixi_app.init({  // wait for the renderer to be available
        backgroundAlpha: 0,  // transparent background so we see the tree
        resizeTo: div_aligned,  // resize with div_aligned
    });

    div_aligned.style.display = "none";  // now we can make it invisible

    // We set the style of the pixi canvas so it is superimposed to div_aligned.
    const style = view.pixi_app.canvas.style;
    style.position = "absolute";
    style.top = "0";
    style.left = "0";
    style.zIndex = "1";  // make sure we are above the svg panel

    div_aligned.appendChild(view.pixi_app.canvas);  // insert canvas in the dom

    view.pixi_sheet = await Assets.load('/static/images/spritesheet.json');
}


function draw_seq(seq, box) {
    const container = new Container();

    const [x0, y0, dx0, dy0] = box;
    const dx = dx0 / seq.length;

    for (let i = 0, x = x0; i < seq.length; i++, x+=dx) {
        container.addChild(draw_char(seq[i], [x, y0, dx, dy0]));
    }

    view.pixi_app.stage.addChild(container);
}


// Return a new sprite with the given character situated in the given box.
function draw_char(char, box) {
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
    view.pixi_app.stage.children.forEach(c => c.destroy({children: true}));

    view.pixi_app.stage.removeChildren();
}
