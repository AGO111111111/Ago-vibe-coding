# Presentation refactor — 2026-10-08

Reference research requested by the user:
- Teable: https://github.com/teableio/teable — reviewed grid.view.ts and kanban.view.ts in packages/core/src/models/view/derivate. Shared ViewCore with view-specific options and column metadata informed keeping one task collection and multiple presentations.
- Plane: https://github.com/makeplane/plane and https://docs.plane.so/core-concepts/views — reviewed documented filters, layouts and views. Task scopes and layout switches are separate from task data.
- AppFlowy Board: https://github.com/AppFlowy-IO/appflowy-board — reviewed README controller/group/card examples and movement callbacks. Inspired status-grouped cards. This app currently uses status selectors, not drag-and-drop.

No external implementation code or assets were copied; no external project dependencies were added.

Scope: navigation grouped by action/direction/review; table/board task views; inline priority/due controls; explicit task detail vs execution; goal/project task visibility; daily review steps; shared visual system.
Data, existing account access and persistence remain in the existing app.

## Finder-style interaction pass

- Finder Clone: https://github.com/guyariely/finder-clone — reviewed src/App/App.js, src/App/App.scss, src/Sidebar/Sidebar.js and src/MenuBar/MenuBar.js. Its framed window, persistent toolbar, sidebar and status bar informed the app shell structure.
- Implemented independently: responsive window frame, collapsible navigation, separate content scrolling, task selection and a non-modal right-hand inspector. Task execution and editing retain focused dialogs. No reference code or assets copied.
- Validation: build and 11 automated tests pass, including detail-versus-execution behavior and inspector dismissal. Browser visual verification was unavailable in this environment.
