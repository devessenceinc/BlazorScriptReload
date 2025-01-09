msnry = new Masonry('.masonry-grid', {
    percentPosition: true
});

imgLoad = imagesLoaded('.masonry-grid');

imgLoad.on('progress', function (instance, image) {
    console.log("Image loaded: ", image.img.src);
    msnry.layout();
});
