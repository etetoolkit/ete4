.. currentmodule:: ete4.smartview

Tree drawing and exploration (web)
==================================

.. contents::

Overview
--------

We can represent and interact with a tree in a flexible way by using
the *explorer* module.

Let's create a simple tree with 100 leaves and randomly populated::

  from random import random
  from ete4 import Tree
  t = Tree()
  t.populate(100, dist_fn=random, support_fn=random)

We can start exploring it with::

  t.explore()

At that moment the web browser will open, and we can use the graphical
user interface (GUI) to interact with our tree using the default
visualization.

.. image:: ../images/gui.png

There are already many things that can be done to change the
visualization by using the menus in the GUI and changing styles, doing
searches, creating labels and more.

But we can also control programatically how to do the visualization,
and in a more flexible way. We do that by using *layouts*.

With a layout we can for example set some style for the lines of the
tree, the dots of the nodes, and many other tree-related styles. Or
change the style of only some nodes that we are interested in. We may
want to add textual or graphical information to certain nodes too.

The concepts that ETE uses to describe the visualization are:

- **Styles** represented as dictionaries. For example ``{'shape':
  'circular', 'hz-line': {'stroke-width': 2}}``.
- **Faces**, pictorial or textual *information pieces* represented by
  the class :class:`Face <faces>`, with a variety of subclasses
  for different kinds of representations (:class:`TextFace
  <faces.TextFace>`, :class:`ImageFace <faces.ImageFace>`, ...). Faces
  know how to return graphic elements showing the information
  corresponding to a node, or to a group nodes collapsed together.
- **Decorations**, a way to describe where to place faces, by means of
  the class :class:`Decoration <layout.Decoration>`. It mainly allows
  to specify the ``position`` where to draw the information relative
  to its node (on *top* of its branch, at its *right*, *aligned*,
  etc.), and in which column to put it (to stack it nicely with other
  faces from the same layout or a different one).
- **Layouts**, full descriptions of how to represent a tree, using the
  class :class:`Layout <layout.Layout>`. They contain a
  :func:`draw_node()` function that produces the decorations and
  styles that we want for a given node, and a :func:`draw_tree()`
  function that does the same for the full tree. They
  exploring/visualizing a tree, they compose: using several layouts
  will add extra graphic representations, and/or overwrite some styles
  from previous layouts.


Launching the explorer
----------------------

To start the visualization of a tree, we can use the :func:`explore
<ete4.Tree.explore>` method as shown above::

  t.explore(...)

If we run it from the Python console, in addition to opening a web
browser session, the call returns immediately and we can continue
working with the tree in the console.

The explorer allows to visualize and also manipulate the tree. You can
in parallel change the tree from the GUI and from the console, and the
changes will be reflected everywhere.

This is very useful, but sometimes we want a different behavior. Let's
see some examples of typical uses.


Standalone scripts
~~~~~~~~~~~~~~~~~~

If we run a standalone script, after the call to :func:`explore
<ete4.Tree.explore>` the program will continue and probably end,
finishing the interactive session at the same time.

We can set the argument ``keep_server=True`` to keep the server running::

  t.explore(keep_server=True)

The program will run until we kill the process (with Ctrl+C for
example).

A better way is to simply wait for some input before continuing, for
example::

  t.explore()
  print('Press enter to stop the server and finish.')
  input()


Verbose mode
~~~~~~~~~~~~

We can set ``verbose=True`` to see all the actions made by the ETE
backend, which can be useful for debugging and for getting an insight
on how the explorer works::

  >>> t.explore(verbose=True)
  Explorer now available at http://127.0.0.1:5000
  127.0.0.1 - - [18/Dec/2024 10:41:39] "GET / HTTP/1.1" 303 0
  127.0.0.1 - - [18/Dec/2024 10:41:39] "GET /static/gui.html?tree=tree-1 HTTP/1.1" 200 1476
  127.0.0.1 - - [18/Dec/2024 10:41:39] "GET /static/gui.css HTTP/1.1" 200 5255
  [...]
  127.0.0.1 - - [18/Dec/2024 10:41:39] "GET /trees HTTP/1.1" 200 36
  127.0.0.1 - - [18/Dec/2024 10:41:39] "GET /static/icon.png HTTP/1.1" 200 686
  127.0.0.1 - - [18/Dec/2024 10:41:39] "GET /trees/tree-1/layouts HTTP/1.1" 200 27
  [...]
  127.0.0.1 - - [18/Dec/2024 10:41:39] "GET /trees/tree-1/draw?shape=rectangular&node_height_min=30&content_height_min=4&zx=375.9&zy=178.79999999999998&x=-0.33333333333333337&y=-0.16666666666666669&w=3.3333333333333335&h=3.3333333333333335&collapsed_shape=skeleton&collapsed_ids=%5B%5D&layouts=%5B%22basic%22%5D&labels=%5B%5D HTTP/1.1" 200 1331


Basic layout (leaf names, branch length and support)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When we call ``t.explore()`` without any arguments, a layout is
automatically added to show the names of the leaf nodes, the branch
lengths and their support (the ``BASIC_LAYOUT``).

We can remove it from the GUI by clicking on it in the menu *layouts*,
or programatically by specifying an empty list of layouts::

  t.explore(layouts=[])

So what happens when we are not explicitely passing the `layouts`
argument? The explorer interprets it as::

  from ete4.smartview import BASIC_LAYOUT
  t.explore(layouts=[BASIC_LAYOUT])

.. TODO: add image


Showing node's properties in a popup
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When we hover with the mouse over a node, we can see its properties in
a popup. By default, only the name, the length, and the support appear
(if they are defined).

By setting the arguments ``show_popup_props`` and ``hide_popup_props`` we
can choose which properties to show. This way the backend only needs
to send the relevant information when drawing the nodes, and we can
visualize only what we want without being overwhelmed.

For example, to show only the property ``dist``::

  t.explore(show_popup_props=['dist'])

Or if we want to see all except some::

  t.explore(show_popup_props=None, hide_popup_props=['dist', 'sequence'])


Control panel
~~~~~~~~~~~~~

When exploring the tree, a control panel will be shown in the left
side of the tree panel.

.. image:: ../images/panel.png

It consists of the three major tabs:

- **Main**: More common settings including layouts, collapsing level, etc.
- **Selections**: For searches, manual collapse and tagging of nodes.
- **Advanced**: With less common settings and operations like sorting, changing styles, etc.


1) Main
^^^^^^^

.. image:: ../images/panel_main.png

This tab contains the general settings of the tree visualization. It
includes among other things:

- **tree**: Selector with current tree (can select other loaded trees).
- **download**: Different ways to download the tree (as newick or as an image).
- **upload**: Allows to upload new trees from their newick representation.
- **shape**: Tree representation as ``rectangular`` or ``circular``.
- **node height min**: Minimum height in pixels to expand a node (otherwise shown as collapsed).
- **content height min**: Minimum height in pixels to show content (content with less height will not show).
- **layouts**: Lists all available layouts and allows to switch them on and off.
- **extra labels**: Allows to add labels, additional pieces of information to attach to nodes.
- **smart zoom**: Zooms making the current node under the cursor grow towards the window.


2) Selections
^^^^^^^^^^^^^

.. image:: ../images/panel_selections.png

This tab contains the searches and selected nodes.

We can make a search with clicking *new search* button (also the "/"
shortcut), then input the query in the search box. There are different
ways to search for nodes.


Simple search
"""""""""""""

We can put a text in the search box to find all the nodes whose name
matches it. The search will be case-insensitive if the text is all in
lower case, and case-sensitive otherwise.

Regular expression search
"""""""""""""""""""""""""

To search for names mathing a given regular expression, we can prefix
the text with the command ``/r`` (the *regexp command*) and follow it
with the regular expression.

Expression search
"""""""""""""""""

When prefixing our text with ``/e`` (the *eval command*), we can use a
quite general Python expression to search for nodes. This is the most
powerful search method available (and the most complex to use).

The expression will be evaluated for every node, and will select those
that satisfy it. In the expression we can use (among others) the
following variables, with their straightforward interpretation:
``node``, ``parent``, ``is_leaf``, ``length`` / ``dist`` / ``d``, ``properties`` /
``p``, ``children`` / ``ch``, ``size``, ``dx``, ``dy``, ``regex``.

Topological search
""""""""""""""""""

Similar to the expression search, if we prefix the text with ``/t`` (the
*topological command*), we can write a newick tree with quoted names
in each node containing an eval command. This will select the nodes
that satisfy the full subtree of expressions that you passed.

Examples
""""""""

Some examples of searches and possible matches:

+----------------------------------------+-------------------------------------------------------+
| Query                                  | Example match                                         |
+========================================+=======================================================+
| ``citrobacter``                        | will match nodes named "Citrobacter werkmanii" and    |
|                                        | "Citrobacter youngae"                                 |
+----------------------------------------+-------------------------------------------------------+
| ``UBA``                                | will match "spx UBA2009" but not "Rokubacteriales"    |
+----------------------------------------+-------------------------------------------------------+
| ``/r sp\d\d``                          | will match any name that contains "sp" followed by    |
|                                        | (at least) two digits, like "Escherichia sp002965065" |
|                                        | and "Citrobacter sp005281345"                         |
+----------------------------------------+-------------------------------------------------------+
| ``/e len(ch) > 2``                     | will match nodes with more than 2 children            |
+----------------------------------------+-------------------------------------------------------+
| ``/e is_leaf and``                     | will match leaf nodes with property "species"         |
| ``p['species'] == 'Homo'``             | equal to "Homo"                                       |
+----------------------------------------+-------------------------------------------------------+
| ``/t ("is_leaf","d > 1")"name=='AB'"`` | will match nodes named "AB" that have                 |
|                                        | two children, one that is a leaf and                  |
|                                        | another that has a length > 1                         |
+----------------------------------------+-------------------------------------------------------+


3) Advanced
^^^^^^^^^^^

.. image:: ../images/panel_advanced.png

This tab contains functions to select subtrees, sort, change styles
and more.

.. TODO: Add image.


Context menu
~~~~~~~~~~~~

We can right-click on a node to open a context menu with different
options.

.. image:: ../images/context_menu.png

There are many node-specific actions such as renaming, collapsing,
moving and more. And there are a few tree actions like reseting the
view, sorting the tree, or converting it to dendogram or ultrametric.


Customizing the visualization
-----------------------------

The main elements used to customize the visualization are *styles*,
*faces*, *decorations*, and *layouts*.


Layouts
~~~~~~~

Layouts contain the ``draw_node()`` and ``draw_tree()`` functions, which
create the styles and faces that we use to represent the tree. They
are objects of the class :class:`Layout <layout.Layout>`. They contain:

- ``name``: Identifies the layout, so it can be activated/deactivated in the GUI.
- ``draw_tree()``: A function that sets style and decorations for the full tree.
- ``draw_node()``: A function that sets style and decorations for the given nodes.
- ``cache_size``: The number of arguments cached when calling `draw_node` (defaults to all).
- ``active``: Whether the layout will be immediately active when exploring (defaults to True).

Let's look at how to use them. The simplest case is::

  from ete4 import Tree
  from ete4.smartview import Layout

  t = Tree()
  t.populate(20)

  layout = Layout(name='I am a layout doing nothing')

  t.explore(layouts=[layout])

We can see a representation of the tree, and in the control panel, a
layout that appears with the name "I am a layout doing nothing".

.. image:: ../images/layout_example.png

It name is accurate, as we can see if we activate or desactivate it by
clicking its checkbox: nothing happens, no extra information is shown
in the tree anyway.


Changing the tree style
~~~~~~~~~~~~~~~~~~~~~~~

The ``draw_tree`` field of a layout specifies the general aspects of the
tree style. For example, we can modify the scale used to render tree
branches or choose between circular or rectangular tree drawing, etc.

In general, it is a function of the tree, and returns a list of
decorations and styles to use.

We often just need to change its style, and in a way that does not
depend on the tree. For that common case, ``draw_tree`` can also be a
dictionary with the style.

A dictionary with the tree style can look like this::

  my_tree_style = {
     'shape': 'circular',  # or 'rectangular'
     'radius': 5,  # in circular mode, minimum radius value
     'angle-start': -pi/2,  # in circular mode, where to start
     'angle-end': pi/2,  # alternatively we can give 'angle-span'
     'node-height-min': 10,  # when to start collapsing nodes
     'content-height-min': 5,  # when to start showing faces
     'collapsed': {'shape': 'outline', 'fill-opacity': 0.8},
     'show-popup-props': None,  # show all defined properties
     'hide-popup-props': ['support'],  # except support
     'is-leaf-fn': lambda node: node.level > 4,  # nodes treated as leaves
     'box': {'fill': 'green', 'opacity': 0.1, 'stroke': 'blue'},
     'dot': {'shape': 'hexagon', 'fill': 'red'},
     'hz-line': {'stroke-width': 2},  # horizontal line to parent
     'vt-line': {'stroke': '#ffff00'},  # vertical line to children
  }

The last four (**box**, **dot**, **hz-line**, **vt-line**) define the
general look for all the nodes, but they can be overriden too in an
individual basis with the function ``draw_node`` as explained below.

The :class:`Layout <layout>` documentation has a complete list of options.

Let's see some examples of how to modify tree style.


Example of simple change
^^^^^^^^^^^^^^^^^^^^^^^^

A simple way to control the tree style is to pass a dictionary with
the options we want to ``draw_tree``::

  from ete4 import Tree
  from ete4.smartview import Layout

  t = Tree()
  t.populate(20)

  layout = Layout(name='my layout',
                  draw_tree={'node-height-min': 100})

  t.explore(layouts=[layout])

.. TODO: Add LegendFace, maybe, and have draw.js put Decoration(...,
   position='top') or 'top-right', etc, put things in that place.
   Then, add an example as in the old tutorial. Something like:
     legend = LegendFace(title='My legend', variable='discrete',
                         colormap={'a': 'red', 'b': 'blue', 'c': 'green'})
     yield Decoration(legend, position='top-right')


Changing the node style
~~~~~~~~~~~~~~~~~~~~~~~

In the same way that we can control the general tree style with a
dictionary of options returned by ``draw_tree``, we can also control the
style of a given node with a dictionary of options returned by
``draw_node``.

It is possible to change the color, thickness of lines and many more
style attributes of the following node elements:

- **box**: The box (area) surrounding the node.
- **dot**: The dot that represents the node itself.
- **hz-line**: The horizontal line that connects it to its parent.
- **vt-line**: The vertical line connecting it to its children.

For all of them there are many options to change their style. The main
options are **fill**, **stroke**, **stroke-width**, **opacity**, but
there are also many more: **fill-opacity**, **stroke-opacity**,
**stroke-linecap**, **stroke-linejoin**, **stroke-miterlimit**,
**stroke-dashoffset**, **stroke-dasharray**, **paint-order**,
**fill-rule**, etc. They are all based on `SVG attributes
<https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Fills_and_Strokes>`_.

In addition to those, some elements have extra attributes:

- **dot**
  - **shape**: Figure (circle, square, ...) or its number of sides, representing the node.
  - **radius**: The approximate radius in pixels of the dot.
- **collapsed** (only used from the tree style)
  - **shape**: Representation of collapsed nodes as "skeleton" or "outline"


Example of simple change
^^^^^^^^^^^^^^^^^^^^^^^^

A simple tree where we change the style for the leaves::

  from ete4 import Tree
  from ete4.smartview import Layout

  t = Tree('((A,B),C);')

  # Nodes will be represented as small red triangles of 5 pixels radius.
  style_dot = {'shape': 'triangle',
               'radius': 10,
               'fill': 'red'}

  # Branch lines (horizontal lines) will be brown and dashed, and 10 pixels thick.
  style_hz_line = {'stroke-dasharray': '5,5',
                   'stroke-width': 10,
                   'stroke': '#964B00'}

  def draw_node(node):
      if node.is_leaf:
          return {'dot': style_dot,
                  'hz-line': style_hz_line}

  layout = Layout(name='My layout', draw_node=draw_node)
  t.explore(layouts=[layout])


.. TODO: Continue :)

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/nodestyle_triangle.png?raw=true
   :alt: alternative text
   :align: center

Now in legend of the layout shows in top-right corner of the tree panel.

Source code can be found in in ETE4 here: `nodestyle_triangle.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/nodestyle_triangle.py>`_.


If you want to draw nodes with different styles, an independent
:class:`NodeStyle` instance must be created for each node.

Simple tree in which the different styles are applied to each node::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, NodeStyle

  t = Tree('((a,b),c);')

  # Draw nodes as small red square of diameter equal fo 10 pixels
  # Create an independent node style for each node, which is
  # initialized with a red foreground color.
  leaf_style = NodeStyle()
  leaf_style["shape"] = "square"
  leaf_style["size"] = 10
  leaf_style["fgcolor"] = "red"

  # we set the foreground color to blue and the size to 30 for the root node
  root_style = NodeStyle()
  root_style["fgcolor"] = "blue"
  root_style["size"] = 30
  root_style["vt_line_type"] = 2
  root_style["vt_line_width"] = 10
  root_style["vt_line_color"] = "#964B00"

  # Draw nodes as small red square of diameter equal fo 10 pixels
  def modify_node_style(node):
      # Let's now modify the aspect of the leaf nodes
      if node.is_leaf:
          node.set_style(leaf_style)
      # Let's now modify the aspect of the root node
      # Check if the node is the root node
      elif node.is_root:
          node.set_style(root_style)
      else:
          pass
      return

  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(name="MyTreeLayout", ns=modify_node_style)
  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)


.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/nodestyle_different.png?raw=true
   :alt: alternative text
   :align: center

Source code can be found in in ETE4 here: `nodestyle_different.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/nodestyle_different.py>`_.

Node faces
~~~~~~~~~~

Node faces are small pieces of graphical information that can be
linked to nodes. For instance, text labels or external images could be
linked to nodes and they will be plotted within the tree image.

Several types of node faces are provided by the main :mod:`smartview`
module, ranging from simple text (:class:`TextFace`) and geometric
shapes (:class:`CircleFace`) or (:class:`RectFace`), to molecular sequence representations
(:class:`SeqFace`), and specific faces for collapsed clade (:class:`OutlinedFace`), etc.

A complete list of available faces can be found at the :mod:`smartview`
reference page. All node faces example with demonstration code can be found in
https://github.com/dengzq1234/ete4_gallery.



Faces position
^^^^^^^^^^^^^^

Faces can be added to different areas around the node, namely
**branch_right**, **branch_top**, **branch_bottom** or **aligned**.
Each area represents a table in which faces can be added through the
:func:`add_face <ete4.Tree.add_face>` method. For instance, if you
want two text labels drawn below the branch line of a given node, a
pair of :class:`TextFace` faces can be created and added to the
columns 0 and 1 of the **branch_bottom** area::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, TextFace

  t = Tree('((a:1,b:1):1,c:1)Root:1;')

  # Draw nodes text face in root node
  def modify_face_position(node):
      if node.is_root:
          node.add_face(TextFace("Hola!", color="red"), column=0, position='branch_bottom')
          node.add_face(TextFace('mundo!', color="blue"), column=1, position='branch_bottom')
      return

  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(name="MyTreeLayout", ns=modify_face_position)
  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_bottom_1.png?raw=true
   :alt: alternative text
   :align: center

If we set the column of "mundo" text face as 0

::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, TextFace

  .....
    node.add_face(TextFace('mundo!', color="blue"), column=0, position='branch_bottom')
  .....
  t.explore(keep_server=True, layouts=layouts)


.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_bottom_2.png?raw=true
   :alt: alternative text
   :align: center

Source code can be found in in ETE4 here: `faceposition_bottom.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_bottom.py>`_.


If you add more than one face to the same area and column, they will
be piled up. If position set **aligned**, the face of node will be drawn
aligned in an aligned column. If doing so, TreeLayout's argument **aligned_faces**
should be set as **True** to avoid the tree node's name overlapped with node faces.

**aligned** position example::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, TextFace

  t = Tree('((a,b),c);')

  # Draw nodes text face in leaf node
  def modify_face_position(node):
      if node.is_leaf:
          node.add_face(TextFace("Hola!", color="red"), column=0, position='aligned')
          node.add_face(TextFace('mundo!', color="blue"), column=1, position='aligned')
      return

  # set aligned_faces=True because we want to align the faces
  tree_layout = TreeLayout(name="MyTreeLayout", ns=modify_face_position, aligned_faces=True)
  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

See the following image

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_aligned.png?raw=true
   :alt: alternative text
   :align: center

Source code can be found in in ETE4 here: `faceposition_aligned.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_aligned.py>`_.

.. note::

  Once a face object is created, it can be linked to one or more
  nodes. For instance, the same text label can be recycled and added
  to several nodes.

Face for collapsed clades
^^^^^^^^^^^^^^^^^^^^^^^^^
A notable feature in smartview in ete4 is able to collapse clades in the tree.
When a clade is collapsed, a triangle will be drawn as default in the node. Therefore,
a face can be added to the collapsed clade to show more information.

For node faces in collapsed clades, modify *collapsed_only* argument to True in method
:func:`add_face <ete4.Tree.add_face>`

**collapsed_only** example::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, TextFace

  t = Tree('((a:1,b:1)n1:1,c):1;')

  # Draw nodes text face in node with name n1
  def modify_face_position(node):
      # find node with name n1
      if node.name == "n1":
          # write text face "Hola" in node n1 and show it in branch_right directly
          node.add_face(TextFace("Hola!", color="red"), column=0, position='branch_right', collapsed_only=False)
          # write text face "Hola" in node n1 and show it in branch_right only when node is collapsed
          node.add_face(TextFace('mundo!', color="blue"), column=1, position='branch_right', collapsed_only=True)
      return

  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(name="MyTreeLayout", ns=modify_face_position)
  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

"Hola" TextFace shown in branch_right of node "n1" directly with argument **collapsed_only=False**

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_collapsed_before.png?raw=true
   :alt: alternative text
   :align: center

"mundo" TextFace shown in branch_right of node "n1" only when node is collapsed with argument **collapsed_only=True**

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_collapsed_after.png?raw=true
   :alt: alternative text
   :align: center


Source code can be found in in ETE4 here: `faceposition_collapsed.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_collapsed.py>`_.

Example of all face positions

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_all.png?raw=true
   :alt: alternative text
   :align: center

Source code can be found in in ETE4 here: `faceposition_all.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceposition_all.py>`_.


Face properties
^^^^^^^^^^^^^^^

Each face instance has its specific config values, although all face
instances contain the same basic attributes that permit to modify
general aspects such as padding, etc.  In order to explore the properties of each face,
a complete list of face attributes can be found in
each :class:`Face` class documentation, such as :class:`TextFace`, :class:`RectFace`, etc.
Here is a very simple example::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, TextFace

  t = Tree('((a:1,b:1):1,c:1):1;')

  top_textface = TextFace(text="branch top!")
  top_textface.color = 'blue'
  top_textface.min_fsize = 6
  top_textface.max_fsize = 25
  top_textface.ftype = 'courier'
  top_textface.padding_x = 0
  top_textface.padding_y = 0
  top_textface.width = None
  top_textface.rotation = 0

  # or all together
  bottom_textface = TextFace(text="branch bottom!", color='red',
              min_fsize=6, max_fsize=25, ftype='sans-serif',
              padding_x=1, padding_y=1, width=None, rotation=0)


  # Draw nodes text face in root node
  def modify_face_property(node):
      node.add_face(top_textface, column=0, position='branch_top')
      node.add_face(bottom_textface, column=0, position='branch_bottom')
      return

  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(name="MyTreeLayout", ns=modify_face_property)
  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceproperties_textface.png?raw=true
   :alt: alternative text
   :align: center

Source code can be found in in ETE4 here: `faceproperties_textface.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/faceproperties_textface.py>`_.


Advanced Layout functions
~~~~~~~~~~~~~~~~~~~~~~~~~

Layout functions act as pre-drawing `hooking functions
<http://en.wikipedia.org/wiki/Hooking>`_. This means that, before a
node is drawn, it is first sent to a layout function. Node properties,
style and faces can be then modified on the fly and returned to the
drawing engine. Thus, layout functions can be understood as a
collection of rules controlling how different nodes should be drawn.

Wrap in function::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, TextFace

  t = Tree('((((a,b),c),d),e);')

  # here to modfiy node style directly inside the function
  def vowel_node_layout(node):
      vowels = {'a', 'e', 'i', 'o', 'u'}

      # here to set the node style
      if node.is_leaf:
          if node.name in vowels:
              node.sm_style['size'] = 15
              node.sm_style['fgcolor'] = 'red'


  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(name="MyTreeLayout", ns=vowel_node_layout)
  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/advance_layout_1.png?raw=true
   :alt: alternative text
   :align: center

Source code can be found in in ETE4 here: `advance_layout.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/advance_layout.py>`_.


Combining styles, faces and layouts
-----------------------------------

Fixed node styles, faces and tree style
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

example ::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, TextFace

  t = Tree('((((a,b),c),d),e);')

  def vowel_tree_style(tree_style):
      text = TextFace("Vowel title", min_fsize=5, max_fsize=12, width=50, rotation=0)
      tree_style.aligned_panel_header.add_face(text, column=0)
      tree_style.add_legend(
          title="MyLegend",
          variable="discrete",
          colormap={"vowel":"red", "conostant":"blue"}
          )

  def vowel_node_layout(node):
      vowels = {'a', 'e', 'i', 'o', 'u'}

      # here to set the node style
      if node.is_leaf:
          if node.name in vowels:
              node.sm_style['size'] = 5
              node.sm_style['fgcolor'] = 'red'
              # here to add text face to node in aligned position
              node.add_face(TextFace('vowel!', color="red"), column=0, position='aligned')

          else:
              node.sm_style['size'] = 5
              node.sm_style['fgcolor'] = 'blue'

              # here to add text face to node in aligned position
              node.add_face(TextFace('not vowel!', color="blue"), column=0, position='aligned')


  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(name="MyTreeLayout",
      ts=vowel_tree_style,
      ns=vowel_node_layout,
      active=True,
      aligned_faces=True)


  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

Combined node styles, faces and tree style into one TreeLayout:

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/combinedlayout_basic.png?raw=true
   :alt: alternative text
   :align: center

Source code can be found in in ETE4 here: `combinedlayout_basic.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/combinedlayout_basic.py>`_.


Define Layout objects
~~~~~~~~~~~~~~~~~~~~~

As we showed above, layout functions can be passed to the TreeLayout
class to create a TreeLayout object. Therefore we can define our own
customized layout.

Example::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, TextFace

  t = Tree('((((a,b),c),d),e);')


  class MyTreeLayout(TreeLayout):
      def __init__(self, name="My First TreeLayout", min_fsize=5, max_fsize=12,
              width=50, rotation=0, vowel_color="red", conostant_color="blue",
              vowel_node_size=5, conostant_node_size=5, aligned_faces=True,
              column=0):

          # Ensuring that any initialization that TreeLayout needs to do is done,
          # before MyTreeLayout goes on to do its own additional initialization.
          super().__init__(name, aligned_faces=True)

          self.name = name
          self.min_fsize = min_fsize
          self.max_fsize = max_fsize
          self.width = width
          self.rotation = rotation

          self.vowel_color = vowel_color
          self.conostant_color = conostant_color
          self.vowel_node_size = vowel_node_size
          self.conostant_node_size = conostant_node_size
          self.aligned_faces = aligned_faces
          self.column = column


      def set_tree_style(self, tree, style):
          text = TextFace(self.name, min_fsize=self.min_fsize,
              max_fsize=self.max_fsize, width=self.width, rotation=self.rotation)

          style.aligned_panel_header.add_face(text, column=self.column)
          style.add_legend(
              title=self.name,
              variable="discrete",
              colormap={"vowel":"red", "conostant":"blue"}
              )

      def set_node_style(self, node):
          vowels = {'a', 'e', 'i', 'o', 'u'}
          vowel_textface = TextFace(
              text="vowel", color=self.vowel_color,
              min_fsize=self.min_fsize, max_fsize=self.max_fsize,
              width=self.width, rotation=self.rotation
          )

          conostant_textface = TextFace(
              text="not vowel!", color=self.conostant_color,
              min_fsize=self.min_fsize, max_fsize=self.max_fsize,
              width=self.width, rotation=self.rotation
          )

          # here to set the node style
          if node.is_leaf:
              if node.name in vowels:
                  node.sm_style['size'] = self.vowel_node_size
                  node.sm_style['fgcolor'] = self.vowel_color

                  # here to add text face to node in aligned position
                  node.add_face(vowel_textface, column=self.column, position='aligned')
              else:
                  node.sm_style['size'] = self.conostant_node_size
                  node.sm_style['fgcolor'] = self.conostant_color

                  # here to add text face to node in aligned position
                  node.add_face(conostant_textface, column=self.column, position='aligned')


  # Create a TreeLayout object, passing in the function
  tree_layout = MyTreeLayout(name="MyTreeLayout", aligned_faces=True, active=True)
  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/combinedlayout_basic.png?raw=true
   :alt: alternative text
   :align: center

Source code can be found in in ETE4 here: `combinedlayout_object.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/combinedlayout_object.py>`_.

Node Backgrounds
~~~~~~~~~~~~~~~~

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/node_backgrounds.png?raw=true
   :alt: alternative text
   :align: center


::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, NodeStyle, TextFace

  t = Tree('((((a1,a2),a3), ((b1,b2),(b3,b4))), ((c1,c2),c3));')

  # set background color for difference node style
  nst1 = NodeStyle()
  nst1["bgcolor"] = "LightSteelBlue"
  nst2 = NodeStyle()
  nst2["bgcolor"] = "Moccasin"
  nst3 = NodeStyle()
  nst3["bgcolor"] = "DarkSeaGreen"
  nst4 = NodeStyle()
  nst4["bgcolor"] = "Khaki"

  # find common ancestors
  n1 = t.common_ancestor(["a1", "a2", "a3"])
  n2 = t.common_ancestor(["b1", "b2", "b3", "b4"])
  n3 = t.common_ancestor(["c1", "c2", "c3"])
  n4 = t.common_ancestor(["b3", "b4"])

  # set color map dictionary
  colormap = {
      "ancestor_a": "LightSteelBlue",
      "ancestor_b": "Moccasin",
      "ancestor_c": "DarkSeaGreen",
      "ancestor_d": "Khaki"
  }

  def get_tree_style(colormap):
      def add_legend(tree_style):
          tree_style.add_legend(
              title = "MyLegend",
              variable = "discrete",
              colormap = colormap
              )
      return add_legend

  def get_background(node):
      # make node name with bigger text
      node.add_face(TextFace(node.name, min_fsize=6, max_fsize=25), column=0, position="branch_right")
      # set node style
      if node == n1:
          node.set_style(nst1)
      elif node == n2:
          node.set_style(nst2)
      elif node == n3:
          node.set_style(nst3)
      elif node == n4:
          node.set_style(nst4)
      return

  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(
      name="MyTreeLayout",
      ns=get_background,
      ts=get_tree_style(colormap),
      active=True)

  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

Source code can be found in in ETE4 here: `node_backgrounds.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/node_backgrounds.py>`_.


Color Strip
~~~~~~~~~~~

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/colorstrip.png?raw=true
   :alt: alternative text
   :align: center

::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, RectFace, TextFace
  import random

  t = Tree('((((a1,a2),a3), ((b1,b2),(d1,d2))), ((c1,c2),c3));')

  # find common ancestors and annotate them
  n1 = t.common_ancestor(["a1", "a2", "a3"])
  n2 = t.common_ancestor(["b1", "b2"])
  n3 = t.common_ancestor(["c1", "c2", "c3"])
  n4 = t.common_ancestor(["d1", "d2"])
  n1.name = "ancestor_a"
  n2.name = "ancestor_b"
  n3.name = "ancestor_c"
  n4.name = "ancestor_d"

  # set color map dictionary
  colormap = {
      "ancestor_a": "LightSteelBlue",
      "ancestor_b": "Moccasin",
      "ancestor_c": "DarkSeaGreen",
      "ancestor_d": "Brown"
  }

  def get_tree_style(colormap):
      def add_legend(tree_style):
          tree_style.add_legend(
              title = "MyLegend",
              variable = "discrete",
              colormap = colormap
              )
          return
      return add_legend

  def get_node_face(colormap):
      def get_background(node):
          # make rectangle face
          if node.name in colormap:
              lca_face = RectFace(
                  width=20,
                  height=None, # circular
                  color=colormap.get(node.name),
                  opacity=0.7,
                  text=node.name,
                  fgcolor='white',
                  min_fsize=6,
                  max_fsize=15,
                  ftype='sans-serif',
                  padding_x=1,
                  padding_y=1,
                  tooltip=None)
              lca_face.rotate_text = True
              node.add_face(lca_face, position='aligned', column=0)

          return
      return get_background


  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(
      name="MyTreeLayout",
      ns=get_node_face(colormap),
      ts=get_tree_style(colormap),
      active=True,
      aligned_faces=True)

  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

Source code can be found in in ETE4 here: `colorstrip.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/colorstrip.py>`_.


Outlined Collapsed Clade
~~~~~~~~~~~~~~~~~~~~~~~~
.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/outline.png?raw=true
   :alt: alternative text
   :align: center

::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, RectFace, TextFace
  import random

  t = Tree('((((a1,a2),a3), ((b1,b2),(d1,d2))), ((c1,c2),c3));')

  # find common ancestors and annotate them
  n1 = t.common_ancestor(["a1", "a2", "a3"])
  n2 = t.common_ancestor(["b1", "b2"])
  n3 = t.common_ancestor(["c1", "c2", "c3"])
  n4 = t.common_ancestor(["d1", "d2"])
  n1.name = "ancestor_a"
  n2.name = "ancestor_b"
  n3.name = "ancestor_c"
  n4.name = "ancestor_d"

  # set color map dictionary
  colormap = {
      "ancestor_a": "LightSteelBlue",
      "ancestor_b": "Moccasin",
      "ancestor_c": "DarkSeaGreen",
      "ancestor_d": "Brown"
  }

  def get_tree_style(colormap):
      def add_legend(tree_style):
          tree_style.add_legend(
              title = "MyLegend",
              variable = "discrete",
              colormap = colormap
              )
          return
      return add_legend

  def get_node_face(colormap):
      def get_background(node):
          # make outline face
          if node.name in colormap:
              lca_face = RectFace(
                  width=20,
                  height=None, # circular
                  color=colormap.get(node.name),
                  opacity=0.7,
                  text=node.name,
                  fgcolor='white',
                  min_fsize=6,
                  max_fsize=15,
                  ftype='sans-serif',
                  padding_x=1,
                  padding_y=1,
                  tooltip=None)
              lca_face.rotate_text = True

              # collapsed nodes
              node.sm_style["draw_descendants"] = False
              node.sm_style["outline_color"] = colormap.get(node.name)

              # show text face
              node.add_face(lca_face, position='aligned', column=0)
              # show text face even for collapsed nodes
              node.add_face(lca_face, position='aligned', collapsed_only=True)

          return
      return get_background


  # Create a TreeLayout object, passing in the function
  tree_layout = TreeLayout(
      name="MyTreeLayout",
      ns=get_node_face(colormap),
      ts=get_tree_style(colormap),
      active=True,
      aligned_faces=True)

  layouts = []
  layouts.append(tree_layout)
  t.explore(keep_server=True, layouts=layouts)

Source code can be found in in ETE4 here: `outline.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/outline.py>`_.


Bar Plot
~~~~~~~~

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/barplot.png?raw=true
   :alt: alternative text
   :align: center


Example ::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, RectFace, TextFace, ScaleFace
  import random

  t = Tree()
  t.populate(20, random_branches=True)

  # annotate numerical values to each leaf
  for node in t.leaves():
      node.add_prop('count', random.randint(1, 100))

  # define tree style function
  def layout_tree_style(tree_style):
      # add scale bar to footer
      scaleface = ScaleFace(
          name='sample1',
          width=150,
          color='black',
          scale_range=(0, 100),
          tick_width=80,
          line_width=1,
          formatter='%.0f',
          min_fsize=6,
          max_fsize=12,
          ftype='sans-serif',
          padding_x=0,
          padding_y=0)

      tree_style.aligned_panel_header.add_face(scaleface, column=0)
      tree_style.aligned_panel_footer.add_face(scaleface, column=0)

      # add title to header and footer
      text = TextFace("Count", min_fsize=5, max_fsize=12, width=50, rotation=0)
      tree_style.aligned_panel_header.add_face(text, column=0)
      return

  # define node Face layout function
  def layout_barplot(node):
      if node.is_leaf:
          width = node.props.get('count') * 1.5
          rect_face = RectFace(
              width=width, height=70, color='skyblue',
              opacity=0.7, text=None, fgcolor='black',
              min_fsize=6, max_fsize=15, ftype='sans-serif',
              padding_x=0, padding_y=0,
              tooltip=None)
          node.add_face(rect_face, position='aligned', column=0)
          return

  # Create a TreeLayout object, passing in the function
  barplot_layout = TreeLayout(
      name='BarPlot',
      ns=layout_barplot,
      ts=layout_tree_style,
      aligned_faces=True)

  # add layout to layouts list
  layouts = []
  layouts.append(barplot_layout)
  t.explore(
      layouts=layouts,
      include_props=("name", "dist", "length"),
      keep_server=True)



Source code can be found in in ETE4 here: `barplot.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/barplot.py>`_.

Heatmap
~~~~~~~


.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/heatmap.png?raw=true
   :alt: alternative text
   :align: center


Example ::

  import matplotlib as mpl
  import numpy as np

  from ete4 import Tree
  from ete4.smartview import TreeLayout, RectFace, TextFace
  import random


  t = Tree()
  t.populate(20, random_branches=True)

  # annotate numerical values to each leaf
  for node in t.leaves():
      node.add_prop('frequence', random.random())

  # define tree style function
  def layout_tree_style(tree_style):
      # add title to header and footer
      text = TextFace("Frequence", min_fsize=5, max_fsize=12, width=50, rotation=0)
      tree_style.aligned_panel_header.add_face(text, column=0)

      tree_style.add_legend(
              title = "Frequence",
              variable='continuous',
              value_range=[0, 1],
              color_range=["darkred", "white"]
              )
      return

  # define node Face layout function
  def layout_heatmap(mincolor, maxcolor):
      #maxval = max(node.props.get('frequence') for node in t.leaves())
      maxval = 1
      minval = 0

      def color_gradient(c1, c2, mix=0):
          """ Fade (linear interpolate) from color c1 (at mix=0) to c2 (mix=1) """
          c1 = np.array(mpl.colors.to_rgb(c1))
          c2 = np.array(mpl.colors.to_rgb(c2))
          return mpl.colors.to_hex((1-mix)*c1 + mix*c2)

      def get_heatmapface(node):
          if node.is_leaf:
              ratio = float(node.props.get('frequence')) / maxval
              gradient_color = color_gradient(mincolor, maxcolor, mix=ratio)
              print_frequnce = f"{node.props.get('frequence'):.2%}"
              rect_face = RectFace(
                  width=50, height=70, color=gradient_color,
                  opacity=0.7, text=print_frequnce, fgcolor='black',
                  min_fsize=6, max_fsize=15, ftype='sans-serif',
                  padding_x=0, padding_y=0,
                  tooltip=None)
              node.add_face(rect_face, position='aligned', column=0)
          return
      return get_heatmapface

  # Create a TreeLayout object, passing in the function
  barplot_layout = TreeLayout(
      name='HeatMap',
      ns=layout_heatmap(mincolor='white', maxcolor='darkred'),
      ts=layout_tree_style,
      aligned_faces=True)

  # add layout to layouts list
  layouts = []
  layouts.append(barplot_layout)
  t.explore(
      layouts=layouts,
      include_props=("name", "dist", "frequence"),
      keep_server=True)

Source code can be found in in ETE4 here: `heatmap.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/heatmap.py>`_.

Visualize Multiple Sequence Alignment and Domain
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Link to Multiple Sequence Alignment

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/msa_layout.png?raw=true

::


  from ete4 import Tree
  from ete4.smartview import TreeLayout, SeqFace, AlignmentFace


  TREEFILE = 'data/tree.nw'
  MSA = 'data/tree.aln.faa'


  t = Tree(open(TREEFILE))


  def get_seqs(fastafile):
      """Read a fasta file and return a dict with d[description] = sequence.

      Example output: {'Phy003I7ZJ_CHICK': 'TMSQFNFSSAPAGGGFSFSTPKT...', ...}
      """
      name2seq = {}
      seq = ''
      for line in open(fastafile):
          if line.startswith('>'):
              if seq:
                  name2seq[head] = seq
                  seq = ''
                  head = line.lstrip('>').rstrip()
              else:
                  head = line.lstrip('>').rstrip()
          else:
              seq += line.rstrip()
      name2seq[head] = seq
      return name2seq



  # get information alignment
  name2seq = get_seqs(MSA)


  for leaf in t:
      leaf.add_prop('seq', name2seq[leaf.name])


  def layout_alnface_gray(node):
      if node.is_leaf:
          seq_face = AlignmentFace(
              node.props.get('seq'),
              seqtype='aa', gap_format='line', seq_format='[]',
              width=800, height=None,
              fgcolor='black', bgcolor='#bcc3d0', gapcolor='gray',
              gap_linewidth=0.2,
              max_fsize=12, ftype='sans-serif',
              padding_x=0, padding_y=0)

          node.add_face(seq_face, position='aligned')
      return

  def layout_alnface_compact(node):
      if node.is_leaf:
          seq_face = AlignmentFace(
              node.props.get('seq'),
              seqtype='aa', gap_format='line', seq_format='compactseq',
              width=800, height=None,
              fgcolor='black', bgcolor='#bcc3d0', gapcolor='gray',
              gap_linewidth=0.2,
              max_fsize=12, ftype='sans-serif',
              padding_x=0, padding_y=0)

          node.add_face(seq_face, position='aligned')
      return

  def layout_seqface(node):
      if node.is_leaf:

          seq_face = SeqFace(
              node.props.get('seq'),
              seqtype='aa', poswidth=1,
              draw_text=True, max_fsize=15, ftype='sans-serif',
              padding_x=0, padding_y=0)

          node.add_face(seq_face, position='aligned')
      return


  layouts = [
      TreeLayout(name='compact_aln', ns=layout_alnface_compact, aligned_faces=True),
      TreeLayout(name='gray_aln', ns=layout_alnface_gray, aligned_faces=True, active=False),
      TreeLayout(name='seq', ns=layout_seqface, aligned_faces=True,  active=False),

  ]

  t.explore(layouts=layouts, keep_server=True)

Source code can be found in in ETE4 here: `msa_layout.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/msa_layout.py>`_.

Domain annotation
~~~~~~~~~~~~~~~~~

.. image:: https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/domain_layout.png?raw=true

::

  from ete4 import Tree
  from ete4.smartview import TreeLayout, SeqFace, SeqMotifFace, AlignmentFace

  # Create a random tree and add to each leaf a random set of motifs
  # from the original set
  t = Tree("((A, B, C, D, E, F, G), H, I);")

  seq = ("-----------------------------------------------AQAK---IKGSKKAIKVFSSA---"
        "APERLQEYGSIFTDA---GLQRRPRHRIQSK-------ALQEKLKDFPVCVSTKPEPEDDAEEGLGGLPSN"
        "ISSVSSLLLFNTTENLYKKYVFLDPLAG----THVMLGAETEEKLFDAPLSISKREQLEQQVPENYFYVPD"
        "LGQVPEIDVPSYLPDLPGIANDLMYIADLGPGIAPSAPGTIPELPTFHTEVAEPLKVGELGSGMGAGPGTP"
        "AHTPSSLDTPHFVFQTYKMGAPPLPPSTAAPVGQGARQDDSSSSASPSVQGAPREVVDPSGGWATLLESIR"
        "QAGGIGKAKLRSMKERKLEKQQQKEQEQVRATSQGGHL--MSDLFNKLVMRRKGISGKGPGAGDGPGGAFA"
        "RVSDSIPPLPPPQQPQAEDED----")

  mixed_motifs = [
          # seq.start, seq.end, shape, width, height, fgcolor, bgcolor
          [10, 100, "[]", None, 20, "black", "rgradient:blue", "arial|8|white|long text clipped long text clipped"],
          [101, 150, "o", None, 20, "blue", "pink", None],
          [155, 180, "()", None, 20, "blue", "rgradient:purple", None],
          [160, 190, "^", None, 24, "black", "yellow", None],
          [191, 200, "<>", None, 22, "black", "rgradient:orange", None],
          [201, 250, "o", None, 22, "black", "brown", None],
          [351, 370, "v", None, 25, "black", "rgradient:gold", None],
          [370, 420, "compactseq", 5, 10, None, None, None],
  ]

  simple_motifs = [
          # seq.start, seq.end, shape, width, height, fgcolor, bgcolor
          [10, 60, "[]", None, 20, "black", "rgradient:blue", "arial|8|white|long text clipped long text clipped"],
          [120, 150, "o", None, 20, "blue", "pink", None],
          [200, 300, "()", None, 20, "blue", "red", "arial|8|white|hello"],
  ]

  box_motifs = [
          # seq.start, seq.end, shape, width, height, fgcolor, bgcolor
          [0,  5, "[]", None, 20, "black", "rgradient:blue", "arial|8|white|10"],
          [10, 25, "[]", None, 20, "black", "rgradient:ref", "arial|8|white|10"],
          [30, 45, "[]", None, 20, "black", "rgradient:orange", "arial|8|white|20"],
          [50, 65, "[]", None, 20, "black", "rgradient:pink", "arial|8|white|20"],
          [70, 85, "[]", None, 20, "black", "rgradient:green", "arial|8|white|20"],
          [90, 105, "[]", None, 20, "black", "rgradient:brown", "arial|8|white|20"],
          [110, 125, "[]", None, 20, "black", "rgradient:yellow", "arial|8|white|20"],
  ]

  def layout_domain(node):
      if node.name == 'A':
          seq_face = SeqMotifFace(seq, width=1000, gapcolor="red")
          node.add_face(seq_face, position='aligned')
      elif node.name == 'B':
          seq_face = SeqMotifFace(seq, seq_format="line", width=1000, gap_format="blank")
          node.add_face(seq_face, position='aligned')
      elif node.name == 'C':
          seq_face = SeqMotifFace(seq, seq_format="line", width=1000)
          node.add_face(seq_face, position='aligned')
      elif node.name == 'D':
          seq_face = SeqMotifFace(seq, seq_format="()", width=1000)
          node.add_face(seq_face, position='aligned')
      elif node.name == 'E':
          seq_face = SeqMotifFace(seq, motifs=simple_motifs, seq_format="-", width=1000)
          node.add_face(seq_face, position='aligned')
      elif node.name == 'F':
          seq_face = SeqMotifFace(seq, motifs=simple_motifs, gap_format="blank", width=1000)
          node.add_face(seq_face, position='aligned')
      elif node.name == 'G':
          seq_face = SeqMotifFace(seq, motifs=mixed_motifs, seq_format="-", width=1000)
          node.add_face(seq_face, position='aligned')
      elif node.name == 'H':
          seq_face = SeqMotifFace(seq=None, motifs=box_motifs, gap_format="line", width=1000)
          node.add_face(seq_face, position='aligned')
      elif node.name == 'I':
          seq_face = SeqMotifFace(seq[30:60], seq_format="seq")
          node.add_face(seq_face, position='aligned')
      return

  layouts = [
      TreeLayout(name='layout_domain', ns=layout_domain, aligned_faces=True),
  ]
  t.explore(layouts=layouts, keep_server=True)

Source code can be found in in ETE4 here: `domain_layout.py example <https://github.com/dengzq1234/ete4_gallery/blob/master/smartview/domain_layout.py>`_.
