let windowManager = {
    globalWindowTopIndex: 100,

    windowList: [],

    _target: null,

    get target(){
        return windowManager._target || O()
    },

    set target(value){
        windowManager._target = value
    },

    focused_id: 0,

    get focused(){
        return windowManager.windowList[windowManager.focused_id]
    },

    // https://cdn.extragon.cloud/lib/WindowManager/1.0:[*]/min.js

    anyMaximized: false,
    maximizedCount: 0,

    onFocused(id, window){ },

    createWindow(options = {}, content = []){
        let tools, id;
    
        let handleHeight = 35;
    
        options = LS.Util.defaults({
            width: 300,
            height: 460,
            minWidth: 200,
            maxWidth: 1000,
            minHeight: 0,
            maxHeight: 1000,
            resizeable: true,
            maximizeable: true,
            minimizeable: true,
            closeable: true,
            handle: true,
            snappingRadius: 50,
            cornerSnapping: true,
        }, options)
    
        let _window = N({
            class: "window-container",
            style: {
                width: (options.width) + "px",
                height: (+ options.height + handleHeight) + "px",
                minWidth: (options.minWidth) + "px",
                maxWidth: (options.maxWidth) + "px",
                minHeight: (options.minHeight + handleHeight) + "px",
                maxHeight: (options.maxHeight - handleHeight) + "px",
            },
            inner: N({
                class: "window" + (options.tags? " " + options.tags.join(" ") : ""),
                inner: [
                    options.handle? N({class: "window-handle", inner: [
                        N("span", {
                            inner: options.title,
                            class: "window-title"
                        }),
                        N({
                            class: "window-buttons",
                            inner:[
                                options.minimizeable? N("button", {accent: "auto", class: "elevated circle", inner: "<i class=bi-dash-lg></i>", onclick() {tools.minimize()}}) : "",
                                options.maximizeable? N("button", {accent: "auto", class: "elevated circle", inner: "<i class=bi-square></i>", onclick() {tools.maximizeToggle()}}) : "",
                                options.closeable? N("button", {accent: "red", class: "elevated circle", inner: "<i class=bi-x-lg></i>", onclick() {tools.close()}}) : "",
                            ]
                        })
                    ]}): "",
                    N({class: "window-content", inner: content}),
                ]
            })
        });
    
        if(options.resizeable) LS.Resize(_window, [1, 1, 1, 1, 1, 1, 1, 1], {
            absolute: true
        }).on("resize", (direction, properties) => {
            if(options.onResize) options.onResize(direction, properties)
        })
        
        let handle;
        
        if(options.handle) handle = LS.Util.RegisterMouseDrag(_window.get(".window-handle"), ".window-buttons *" + (options.handleInteractableSelector? `, ${options.handleInteractableSelector}`: ""), {
            buttons: [0],
            cursor: "grabbing"
        })
    
        if(options.handle) _window.get(".window-handle").on("dblclick", event => {
            if(event.target.tagName === "button") return;

            tools.maximizeToggle()
        })


        let initialX = M.x,
            initialY = M.y,
            initialBound
        ;
    
        function onMoveStart(){
            initialX = M.x
            initialY = M.y

            initialBound = _window.getBoundingClientRect()
            currentX = initialBound.left
            currentY = initialBound.top
            previousX = currentX
            previousY = currentY
    
            if(options.onMoveStart) options.onMoveStart()
        }
    
        if(options.handle) handle.on("start", onMoveStart)
    
        if(options.handle) handle.on("move", () => {
            if(tools.maximized) {
                tools.maximized = false
                _window.style.top = (M.y - (M.y / 2)) + "px"
                _window.style.left = (M.x - (M.x / 2)) + "px"
                initialBound = _window.getBoundingClientRect();
            }
            
            let currentBound = _window.getBoundingClientRect();
    
            currentX = Math.max((currentBound.width * -1) + 65, Math.min(innerWidth - 65, (M.x - (initialX - initialBound.left)))),
            currentY = Math.max(0, Math.min(innerHeight - 200, (M.y - (initialY - initialBound.top))))

            // Window snapping
            if(options.cornerSnapping){
                if((currentX <= 0 && currentX > -options.snappingRadius && currentX < previousX) || (currentX + currentBound.width >= innerWidth && currentX + currentBound.width < innerWidth + options.snappingRadius && currentX > previousX)) currentX = previousX;
                if(currentY + currentBound.height >= innerHeight && currentY + currentBound.height < innerHeight + options.snappingRadius && currentY > previousY) currentY = previousY;
            }
            
            _window.style.left = currentX + "px"
            _window.style.top = currentY + "px"

            if(options.onMove) options.onMove()

            previousX = currentX
            previousY = currentY
        })
    
        if(options.handle) handle.on("end", () => {
            if(options.onMoveEnd) options.onMoveEnd()
        })
    
        _window.on("mousedown", "touchstart", ()=>{
            tools.focus()
        })
    
        let previousState;
        
        let is_maximized = false;

        tools = {
            element: _window,
    
            options,
    
            gid: M.GlobalID,
    
            focus(){
                windowManager.globalWindowTopIndex++
                _window.style.zIndex = windowManager.globalWindowTopIndex
    
                Q(".window-container.focused").all().class("focused", 0)
                _window.class("focused")

                windowManager.focused_id = id;

                windowManager.onFocused(id, tools)

                if(options.onFocus) options.onFocus()
            },
    
            close(){
                let prevent;
                if(options.onClosed) options.onClosed({
                    prevent(){
                        prevent = true
                    }
                })
    
                if(prevent) return;
    
                _window.remove()
                delete windowManager.windowList[id]
            },
    
            minimize(){
                LS.Toast.show("Got nowhere to minimize the window to (yet)", {
                    accent: "red",
                    timeout: 3000
                })
            },
    
            get maximized(){
                return is_maximized
            },
    
            set maximized(boolean){
                boolean = !!boolean
                is_maximized = boolean
    
                _window.class("maximized", boolean)
    
                if(boolean){
                    previousState = _window.getBoundingClientRect();
    
                    _window.applyStyle({
                        top: 0 + "px",
                        left: 0 + "px",
                        width: "100%",
                        height: "100%",
                        minWidth: "unset",
                        maxWidth: "unset",
                        minHeight: "unset",
                        maxHeight: "unset",
                    })

                    windowManager.maximizedCount++
                    windowManager.anyMaximized = !!windowManager.maximizedCount
                } else {
                    _window.applyStyle({
                        top: previousState.top + "px",
                        left: previousState.left + "px",
                        height: previousState.height + "px",
                        width: previousState.width + "px",
                        minWidth: (options.minWidth) + "px",
                        maxWidth: (options.maxWidth) + "px",
                        minHeight: (options.minHeight + handleHeight) + "px",
                        maxHeight: (options.maxHeight - handleHeight) + "px",
                    })

                    if(windowManager.maximizedCount > 0) windowManager.maximizedCount--
                    windowManager.anyMaximized = !!windowManager.maximizedCount
                }

                if(options.onResize) options.onResize(null, null)
            },
    
            maximize(){
                tools.maximized = true;
            },
    
            maximizeToggle(){
                tools.maximized = !tools.maximized;
            },
    
            addToWorkspace(){
                windowManager.target.add(_window)
                tools.focus()
            },

            bell(){

            }
        }
    
        id = windowManager.windowList.push(tools) - 1

        tools.id = id;
    
        return tools
    }
}