const createCanvas = () => {
  var canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.id = "gameCanvas";
  document.body.appendChild(canvas);

  return canvas;
};

export default createCanvas;
