# CAD Asset Structure for Website v4.1

This package intentionally does **not** bundle large CAD assets. Keep this core website small, then place your CAD files in the paths below.

## Run locally

Browser STL previews use `fetch()`, so run the folder through a local server instead of opening HTML directly:

```bash
cd Website_v4.1_CAD_Integrated_Core
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/homelab.html#cad
```

## Required folders and filenames

```text
cad/
  BattleTiles/
    TileBase_L1_v1/
      TileBase_L1_v1.stl
      TileBase_L1_v1.FCStd
    TileBase_L2_v1/
      TileBase_L2_v1.stl
      TileBase_L2_v1.FCStd
    TileBase_L3_v1/
      TileBase_L3_v1.stl
      TileBase_L3_v1.FCStd
    PowerTile_V1/
      PowerTile_V1.ctb

  CarAudio/
    Mid_Speaker_Mount/
      Mid_Speaker_Mount.FCStd
      Mid_Speaker_Mount-Top.stl
      Mid_Speaker_Mount-Bottom.stl
      Mid_Speaker_Mount_Top.ctb
      Mid_Speaker_Mount_Bottom.ctb
    Tweeter_Mount_Universal/
      Tweeter_Mount_Universal.stl
      Tweeter_Mount_Universal.FCStd
      Tweeter_Mount_Universal.ctb

  ToolSystems/
    1-4in_SocketTree_Test/
      1-4in_SocketTree_Test.stl
      1-4in_SocketTree_v1.FCStd
      1-4in_SocketTree_Test.ctb
    3-8in_SocketTree_Test/
      3-8in_SocketTree_Test.stl
      3-8in_SocketTree_Test.FCStd
      3-8in_SocketTree_Test.ctb
```

## Where project metadata lives

Edit `cad-manifest.json` to rename projects, change descriptions, or add new CAD files without editing HTML.
