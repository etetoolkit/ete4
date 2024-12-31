"""
Tests related to the indentation parser.
"""

from ete4 import Tree, indent


def test_indent():
    tree_text = """\
    a
      b
      c
        d
        e
      f
    g
      h
    """.rstrip()

    nw = '((b,(d,e)c,f)a,(h)g);'

    t = Tree(tree_text, parser='indent')

    assert t.write(parser=1) == nw


def test_loads():
    tree_text = """\
├─┐
│ ├─┐
│ │ ├─╴e
│ │ └─╴f
│ └─╴d
└─┐
  ├─┐
  │ ├─╴g
  │ └─╴a
  └─┐
    ├─╴c
    └─┐
      ├─╴h
      └─╴b
    """.rstrip()

    nw = '(((e,f),d),((g,a),(c,(h,b))));'

    assert indent.loads(tree_text).write() == nw


def test_parse_content():
    tree_text = """\
cs,0.0
├─┐bi,8.0
│ ├─┐fe,7.0
│ │ ├─╴xd,4.0
│ │ └─╴xr,1.0
│ └─┐jw,2.0
│   ├─╴yh,8.0
│   └─┐xk,2.0
│     ├─┐gx,7.0
│     │ ├─╴hw,2.0
│     │ └─╴ax,9.0
│     └─╴on,4.0
└─┐in,6.0
  ├─╴wb,1.0
  └─╴mc,8.0
    """.rstrip()

    nw = '(((xd:4,xr:1)fe:7,(yh:8,((hw:2,ax:9)gx:7,on:4)xk:2)jw:2)bi:8,(wb:1,mc:8)in:6)cs:0;'

    def parse_content(content):
        name, dist = content.split(',')
        return Tree({'name': name, 'dist': float(dist)})

    t = indent.loads(tree_text, parse_content)

    assert t.write(props=['name', 'dist'], parser=1, format_root_node=True) == nw


def test_indent_chars():
    tree_text = """\
root
~~~~~ n00
~~~~~ n01
~~~~~~~~~ n010
~~~~~~~~~ n011
~~~~~ n02
    """.rstrip()

    nw = '(n00,(n010,n011)n01,n02)root;'

    t = indent.loads(tree_text, indent_chars=' ~')

    assert t.write(parser=1, format_root_node=True) == nw
