// Search-related functions.

import { view, menus, get_tid } from "./gui.js";
import { draw_tree } from "./draw.js";
import { api } from "./api.js";

export { search, remove_searches, get_search_class, colorize_searches };


// Search nodes in the server and redraw the tree (with the results too).
async function search(query="", color=undefined, redraw=true) {
    let message = undefined;  // to show the previous error

    while (true) {  // keep on querying until we exit or have a good query
        const result = await get_query(message, query);

        if (!result.isConfirmed)  // we pressed ESC or clicked outside
            return false;  // we are done, and didn't add anything

        query = result.value;  // update the text of our last query

        if (query === "?") {
            await show_search_help();
            continue;
        }

        try {
            if (query in view.searches)
                throw new Error("Search already exists.");

            const qs = `text=${encodeURIComponent(query)}`;
            const response = await api(`/trees/${get_tid()}/search?${qs}`);

            if (response.message !== "ok")
                throw new Error(response.message);

            add_search(query, response.nresults, response.nparents, color);

            if (redraw)
                draw_tree();

            return true;  // we are done, and we added a new search
        }
        catch (exception) {
            message = exception.message;  // and we will query again
        }
    }
}


// Show dialog asking for a (non-empty) query, with optional message and query.
async function get_query(message, query_last) {
    return await Swal.fire({
        html: message,
        inputValue: query_last,
        input: "text",
        position: "bottom-start",
        inputPlaceholder: "Enter query (or ? for help)",
        showConfirmButton: false,
        preConfirm: text => {
            const query = text.trim();
            if (!query)
                return false;  // prevent popup from closing
            else
                return query;
        },
    });
}


// Update view.searches and the gui menus.
function add_search(query, nresults, nparents, color) {
    const colors = ["#FF0", "#F0F", "#0FF", "#F00", "#0F0", "#00F"];
    const nsearches = Object.keys(view.searches).length;

    view.searches[query] = {
        results: {n: nresults,
                  opacity: 0.4,
                  color: color ? color : colors[nsearches % colors.length]},
        parents: {n: nparents,
                  color: "#000",
                  width: 5},
        order: menus.searches.children.length,
    };

    add_search_to_menu(query);

    update_order_lists();  // so this new position appears everywhere
}


// Update the lists with the sort order for each search.
function update_order_lists() {
    const folders = menus.searches.children.slice(1);
    // menus.searches has a button first, and then the search folders.

    const order_options = {};  // to use as the options for the list with orders
    for (let i = 0; i < folders.length; i++)
        order_options[i] = `${i}`;  // {"0": "0", "1": "1", ...}

    folders.forEach((folder, i) => update_order_list(folder, i, order_options));
}


function update_order_list(folder, i, order_options) {
    const index_of_list = folder.children.length - 2;
    // The list is the element before the last one.

    folder.children[index_of_list].dispose();  // delete the drowpdown list

    const sdata = view.searches[folder.title];

    sdata.order = `${i}`;
    const old_order = sdata.order;  // to switch the other to this when changed

    folder.addBinding(sdata, "order", {
        index: index_of_list,  // we put the list in the same position it was
        label: "sort order",
        options: order_options,
      }).on("change", () => {
          // Switch search that was in that order before to our old order.
          Object.values(view.searches)
              .filter(s => s.order === sdata.order && s !== sdata)
              .map(s => s.order = old_order);

          setTimeout(reconstruct_search_folders);  // don't delete us yet!
      });
}


function reconstruct_search_folders() {
    // Remove them all.
    const folders = menus.searches.children.slice(1);
    folders.forEach(folder => folder.dispose());

    // Add the searches in order.
    Object.entries(view.searches)
        .sort(([,s1], [,s2]) => Number(s1.order) - Number(s2.order))
        .map(([text,]) => text)
        .forEach(add_search_to_menu);

    update_order_lists();

    colorize_searches();
}


// Return a class name related to the results of searching for text.
function get_search_class(text, type="results") {
    return "search_" + type + "_" + text.replace(/[^A-Za-z0-9_-]/g, '');
}


// Add a folder to the menu that corresponds to the given search text
// and lets you change the result nodes color and so on.
function add_search_to_menu(text) {
    const folder = menus.searches.addFolder({title: text, expanded: false});

    const sdata = view.searches[text];  // search object with all relevant data

    sdata.remove = function() {
        delete view.searches[text];
        folder.dispose();
        update_order_lists();
        draw_tree();
    }

    const folder_style = folder.controller.view.buttonElement.style;

    folder_style.background = sdata.results.color;

    const on_change = () => {
        folder_style.background = sdata.results.color;
        colorize_search(text);
    }

    sdata.edit = async function() {
        const added = await search(text, sdata.results.color, false);
        // TODO: Make it appear at the same position as the replaced search?
        sdata.remove();
    }

    folder.addButton({title: "edit"}).on("click", sdata.edit);

    const folder_results = folder.addFolder(
        {title: `results (${sdata.results.n})`, expanded: false});
    folder_results.addBinding(sdata.results, "opacity", {min: 0, max: 1, step: 0.01})
        .on("change", on_change);
    folder_results.addBinding(sdata.results, "color")
        .on("change", on_change);

    const folder_parents = folder.addFolder(
        {title: `parents (${sdata.parents.n})`, expanded: false});
    folder_parents.addBinding(sdata.parents, "color")
        .on("change", on_change);
    folder_parents.addBinding(sdata.parents, "width", {min: 0.1, max: 20})
        .on("change", on_change);

    folder.addBinding(sdata, "order", {label: "sort order", options: {}});

    folder.addButton({title: "remove"}).on("click", sdata.remove);
}


// Apply colors (and opacity) to results and parents of a search made
// on the given text.
function colorize_search(text) {
    const sdata = view.searches[text];

    // Select (by their class) elements that are the results and
    // parents of the search, and apply the style (color and
    // opacity) specified in view.searches[text].

    const cresults = get_search_class(text, "results");
    Array.from(div_tree.getElementsByClassName(cresults)).forEach(e => {
        e.style.opacity = sdata.results.opacity;
        e.style.fill = sdata.results.color;
    });

    const cparents = get_search_class(text, "parents");
    Array.from(div_tree.getElementsByClassName(cparents)).forEach(e => {
        e.style.stroke = sdata.parents.color;
        e.style.strokeWidth = sdata.parents.width;
    });
}


// Colorize all the elements related to searches (nodes that are the
// results, and lines for their parent nodes).
function colorize_searches() {
    Object.entries(view.searches)
        .sort(([,s1], [,s2]) => Number(s1.order) - Number(s2.order))
        .forEach(([text,]) => colorize_search(text));
}


// Empty view.searches.
function remove_searches() {
    const texts = Object.keys(view.searches);
    texts.forEach(text => view.searches[text].remove());
}


async function show_search_help() {
    const help_text = `
<div style="text-align: left">

<details>
<summary><b>Simple search</b></summary>
<span>

<p>Put a text in the search box to find all the nodes whose name matches
it.</p><br />

<p>The search will be <i>case-insensitive</i> if the text is all in lower
case, and <i>case-sensitive</i> otherwise.</p>

</span>
</details>

<br />

<details>
<summary><b>Regular expression search</b></summary>
<span>

<p>To search for names matching a given regular expression, you can prefix your
text with the command <b>/r</b> (the <i>regexp command</i>) and follow it
with the regular expression.</p>

</span>
</details>

<br />

<details>
<summary><b>General expression search</b></summary>
<span>

<p>When prefixing your text with <b>/e</b> (the <i>eval command</i>),
you can use a Python expression to search for nodes.
The expression will be evaluated for every node, and the ones that satisfy
it will be selected.</p><br />

<p>In the expression you can use, among others, the following
symbols: <b>node</b>,
<b>parent</b>, <b>name</b>, <b>is_leaf</b>, <b>length</b> or <b>dist</b> or <b>d</b>,
<b>properties</b> or <b>props</b> or <b>p</b>, <b>children</b> or <b>ch</b>,
<b>size</b>, <b>dx</b>, <b>dy</b>, <b>regex</b>.</p>

</span>
</details>

<br />

<details>
<summary><b>Topological search</b></summary>
<span>

<p>Similar to the expression search, if you prefix your text with <b>/t</b>
(the <i>topological command</i>), you can write a newick tree with quoted
names in each node containing an eval command. This will select the nodes
that satisfy the full subtree of expressions that you passed.</p>

</span>
</details>

<br />

<details>
<summary><b>Examples</b></summary>
<span>

<table style="margin: 0 auto">
<thead>
<tr><th>Search text</th><th></th><th>Possible matches</th></tr>
</thead>
<tbody>

<tr><td></td><td>&nbsp;&nbsp;&nbsp;</td><td></td></tr>
<tr><td style="text-align: left"><code>citrobacter</code></td><td></td>
<td style="text-align: left">
nodes named "[...]citrobacter[...]" (case insensitive)
</td></tr>

<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr><td style="text-align: left"><code>BA</code></td><td></td>
<td style="text-align: left">
matches "UBA20" but not "Rokubacteria"
</td></tr>

<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr><td style="text-align: left"><code>/r sp\\d\\d</code></td><td></td>
<td style="text-align: left">
any name with "sp" followed by 2 digits, like "E. sp0029" and "C. sp0052"
</td></tr>

<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr><td style="text-align: left"><code>/e d &gt; 1</code></td><td></td>
<td style="text-align: left">
nodes with length &gt; 1
</td></tr>

<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr><td style="text-align: left"><code>/e is_leaf and p['species'] == 'Homo'</code></td><td></td>
<td style="text-align: left">
leaf nodes with property "species" equal to "Homo"
</td></tr>

<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr><td style="text-align: left"><code>/t ("is_leaf","d > 1")"name=='AB'"</code></td><td></td>
<td style="text-align: left">
nodes named "AB" with two children, one that is a leaf and another that has a length &gt; 1
</td></tr>

</tbody>
</table>

</span>
</details>

</div>
`;
    await Swal.fire({
        title: "Searching nodes",
        html: help_text,
        width: "80%",
    });
}
