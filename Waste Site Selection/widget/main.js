var view, draw, coordinates;
let graphics = [];

const LoadMap = () => {
  require(["esri/Map", "esri/views/MapView", "esri/views/draw/Draw"], (
    Map,
    MapView,
    Draw
  ) => {
    let map = new Map({
      basemap: "hybrid",
    });
    const center = ([31.181785420115183, 29.886132346632454]);
    view = new MapView({
      id: "view",
      container: "viewDiv",
      map: map,
      zoom: 11,
      center:center,
      popup: {
        dockEnabled: true,
        dockOptions: {
          breakpoint: false,
          buttonEnabled: false,
          position: "bottom-center",
        },
      },
    });

    draw = new Draw({
      view: view,
    });
    ViewUI();
    document.getElementById("pin-button").onclick = () => {
      DrawPoint();
    };
  });
};

const ViewUI = () => {
  require([
    "esri/widgets/Home",
    "esri/widgets/Compass",
    "esri/widgets/ScaleBar",
  ], (Home, Compass, ScaleBar) => {

    view.ui.add(
      new Home({
        view: view,
      }),
      "top-left"
    );
    view.ui.move(["zoom"], "top-left");

    view.ui.add(
      new Compass({
        view: view,
      }),
      "top-left"
    );
    view.ui.add("pin-button", "top-left");
    view.ui.add("list-button", "top-left");
    view.ui.add(
      new ScaleBar({
        view: view,
      }),
      "bottom-left"
    );

    view.ui.add("app-search", "top-right");
  });
};

const DrawPoint = () => {
  require(["esri/Graphic"], (Graphic) => {
    view.surface.style.cursor = "crosshair";
    let pointAction = draw.create("point");


    pointAction.on("draw-complete", (evt) => {
      coordinates = evt.vertices[0];
      view.graphics.removeAll();
      let point = {
        type: "point",
        x: coordinates[0],
        y: coordinates[1],
        spatialReference: view.spatialReference,
      };
      let graphic = new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker",
          color: [244, 67, 54],
          path:
            "M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13c0,-3.87 -3.13,-7 -7,-7zM12,11.5c-1.38,0 -2.5,-1.12 -2.5,-2.5s1.12,-2.5 2.5,-2.5 2.5,1.12 2.5,2.5 -1.12,2.5 -2.5,2.5z",
          size: 32,
          yoffset: 16,
          outline: {
            width: 0,
          },
        },
        
      });
      view.graphics.add(graphic);
      view.surface.style.cursor = "";
      document.querySelector("#app-search").style.display = "";
    });
  });
};

const SendMessage = () => {
  let d = new Date();
  let msg = {
    name: document.querySelector("#txtName").value,
    phone: document.querySelector("#txtPhone").value,
    email: document.querySelector("#txtEmail").value,
    FactoryType: document.querySelector("#FToption").value,
    WasteType: document.querySelector("#WToption").value,
    msg: document.querySelector("#txtMessage").value,
    x: coordinates[0],
    y: coordinates[1],
    messageDate: d.toDateString(),
  };


  let messages = JSON.parse(localStorage.getItem("messages"));

  localStorage.setItem(
    "messages",
    JSON.stringify(messages ? [...messages, msg] : [msg])
  );
  view.graphics.removeAll();
  document.querySelector("#app-search").style.display = "none";
  console.log("messages", JSON.parse(localStorage.getItem("messages")));
  openSnackbar();
};

const GetAllMessage = () => {
  view.graphics.removeAll();
  graphics = [];
  require([
    "esri/layers/FeatureLayer",
    "esri/layers/support/Field",
    "esri/Graphic",
  ], (FeatureLayer, Field, Graphic) => {
    const messages = JSON.parse(localStorage.getItem("messages"));

    if (!messages) return;
    let popupTemplate = {
      title: "{name} - {FactoryType} - {WasteType}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "name",
              label: "Name",
            },
            {
              fieldName: "phone",
              label: "Phone",
            },
            {
              fieldName: "email",
              label: "Email",
            },
            {
              fieldName: "FactoryType",
              label: "Factory Type",
            },
            {
              fieldName: "WasteType",
              label: "Waste Type",
            },
            {
              fieldName: "msg",
              label: "Message",
            },
            {
              fieldName: "messageDate",
              label: "DateTime",
            },
          ],
        },
      ],
    };
    messages.map((msg) => {
      var graphic = new Graphic({
        geometry: {
          type: "point",
          x: msg.x,
          y: msg.y,
          spatialReference: view.spatialReference,
        },
        symbol: {
          type: "simple-marker",
          color: "red",
        },
        attributes: msg,
        popupTemplate: popupTemplate,
      });
      graphics.push(graphic);
    });

    const fields = [
      new Field({
        name: "ObjectID",
        alias: "ObjectID",
        type: "oid",
      }),
      new Field({
        name: "name",
        alias: "name",
        type: "string",
      }),
      new Field({
        name: "phone",
        alias: "phone",
        type: "string",
      }),

      new Field({
        name: "email",
        alias: "email",
        type: "string",
      }),
      new Field({
        name: "FactoryType",
        alias: "FactoryType",
        type: "string",
      }),
      new Field({
        name: "WasteType",
        alias: "WasteType",
        type: "string",
      }),
      new Field({
        name: "msg",
        alias: "msg",
        type: "string",
      }),
    ];

    var renderer = {
      type: "unique-value",
      legendOptions: {
        title: "Complains and Suggestions",
      },
      defaultSymbol: {
        type: "simple-marker",
        color: "gray",
        outline: null,
      },
      defaultLabel: "Feedback",
      field: "FactoryType",
      uniqueValueInfos: [
        {
          value: "Extractor",
          symbol: {
            type: "simple-marker",
            color: "red",
            outline: null,
          },
          label: "Extractor",
        },
        {
          value: "Receiver",
          symbol: {
            type: "simple-marker",
            color: "green",
            outline: null,
          },
          label: "Receiver",
        },
      ],
    };
    
    const layer = new FeatureLayer({
      source: graphics,
      fields: fields,
      renderer: renderer,
      popupTemplate: popupTemplate,
    });

    view.map.add(layer);
  });
};

const DisplayMessages = () => {
  GetAllMessage();
  view.popup.open({
    features: graphics,
    featureMenuOpen: true,
    updateLocationEnabled: true,
  });
};

const CloseForm = () => {
  view.graphics.removeAll();
  document.querySelector("#app-search").style.display = "none";
};

const openSnackbar = () => {
  var x = document.getElementById("snackbar");
  x.className = "show";
  x.innerHTML = "we will contact you, Thanks";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 5000);
};

