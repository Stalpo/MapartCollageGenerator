// prepare images
const imgs = [];
const files = [];
const imgcount = 1202;
const imgratio = [2, 1];

for(let i = 1; i <= imgcount; i++){
    files.push(`2b2t_MAPART_${i}.png`);
}

function downloadAsset(assetName){
    return new Promise(resolve => {
        const asset = new Image();
        asset.onload = () => {
            //console.log(`Downloaded ${assetName}`);
            imgs.push(asset);
            resolve();
        };
        asset.src = `/imgs/${assetName}`;
    });
}

console.log("Downloaded imgs...");
Promise.all(files.map(downloadAsset)).then(() => {
    console.log("Done\n");

    // get total img area
    let area = 0;
    for(let i = 0; i < imgcount; i++){
        const img = imgs[i];
        area += img.width * img.height;
    }
    const totalArea = area;
    const totalMapIds = totalArea / 128 / 128;
    console.log(`Total Area: ${totalArea}, Total Map Ids: ${totalMapIds}`);

    // get desired dimensions
    let w = imgratio[0];
    let h = imgratio[1];
    let s = w * h;
    while(s < totalMapIds){
        w += imgratio[0];
        h += imgratio[1];
        s = w * h;
    }
    const width = w;
    const height = h;
    const size = width * height;
    const empty = size - totalMapIds;
    const numtoremove = totalMapIds - (width - imgratio[0]) * (height - imgratio[1]);
    console.log(`Width: ${width}, Height: ${height}`);
    console.log(`Empty: ${empty}, Remove for next smallest: ${numtoremove}`);

    // sort imgs by height then width
    imgs.sort(function(x, y) {
        if (x.height > y.height) {
            return -1;
        }
        else if (x.height < y.height) {
            return 1;
        }else{
            if (x.width > y.width) {
                return -1;
            }
            else if (x.width < y.width) {
                return 1;
            }else{
                return 0;
            }
        }
    });

    // initialize img pos vars
    const imgpositions = [];
    let possiblepositions = [{
        x: 0,
        y: 0,
        xroom: width,
        yroom: height
    }];
    const spaces = [];
    for(let x = 0; x < width; x++){
        spaces.push([]);
        for(let y = 0; y < height; y++){
            spaces[x].push(true);
        }
    }

    // get img postions
    for(let i = 0; i < imgcount; i++){
        const img = imgs[i];
        const imgwidth = img.width / 128;
        const imgheight = img.height / 128;

        let placed = false;
        for(let k = 0; k < possiblepositions.length; k++){
            const posspos = possiblepositions[k];

            // found position
            if(posspos.xroom >= imgwidth && posspos.yroom >= imgheight){
                placed = true;
                imgpositions.push({
                    imgindex: i,
                    x: posspos.x,
                    y: posspos.y
                });

                // update possible positions
                for(let dx = 0; dx < imgwidth; dx++){
                    for(let dy = 0; dy < imgheight; dy++){
                        spaces[posspos.x + dx][posspos.y + dy] = false;
                    }
                }

                possiblepositions = [];
                for(let y = 0; y < height; y++){
                    for(let x = 0; x < width; x++){
                        if(spaces[x][y]){
                            let topclosed = true;
                            if(y != 0){
                                if(spaces[x][y - 1]){
                                    topclosed = false;
                                }
                            }

                            if(topclosed){
                                let boundx = x;
                                let boundy = y;
                                while(boundy < height){
                                    if(!spaces[boundx][boundy]){
                                        break;
                                    }
                                    boundy++;
                                }
                                while(boundx < width){
                                    let boundxblocked = false;
                                    for(let checky = y; checky < boundy; checky++){
                                        if(!spaces[boundx][checky]){
                                            boundxblocked = true;
                                        }
                                    }
                                    if(boundxblocked){
                                        break;
                                    }
                                    boundx++;
                                }

                                possiblepositions.push({
                                    x: x,
                                    y: y,
                                    xroom: boundx - x,
                                    yroom: boundy - y
                                });
                            }
                        }
                    }
                }

                break;
            }
        }
        if(!placed){
            console.log(`Failed to place img of width: ${imgwidth}, height: ${imgheight}`);
        }
    }

    // create collage image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 128 * width;
    canvas.height = 128 * height;

    for(let i = 0; i < imgpositions.length; i++){
        const imgpos = imgpositions[i]
        const img = imgs[imgpos.imgindex];
        ctx.drawImage(img, imgpos.x * 128, imgpos.y * 128);
    }

    // download image
    var link = document.createElement('a');
    link.download = 'mapartcollage.png';
    link.href = canvas.toDataURL();
    link.click();
});