# stlplater

drag and drop stls to be plated for 3d printing

![stlplater](screen.png)

# install

```
git clone git://github.com/tmpvar/stlplater.git
cd stlplater
npm install
```

# use

`npm run start`

and navigate to `/public/index.html`

Once there, start dragging .stl files on the page and it will compute if/where the stl can fit on the plate

Resizing the page should re-orient the boxes.

pressing `control|alt|meta + s` will download a file (`stlplater.stl`) which includes all of the models you've added.


# todo

 * plate size definition in real world units
 * spinner while processing stl
 * label stls
 * allow pan+zoom
 * add webgl view to re-orient the stl (e.g. choose a different axis as the mesh bottom)

# license

[MIT](LICENSE.txt)
