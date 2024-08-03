// Globals

let
    app,
    os_cacheKey = 17.4 + Math.random()
;


(() => {
    let tabs, init = async function (lstv) {
        let logContainer = O("#commandConsole"), os;

        tabs.setActive("mainWorkspace")

        O("#userName").set(lstv? lstv.fragment.displayname : "Local user")

        // Begin loading the virtual OS!
        if(!await (async () => {
            const loadingModalText = N(), loadingModalBarElement = N({class: "style-round"});
        
            let loadingModal = LS.Modal.build({
                title: "Loading your workspace",
                uncancelable: true,
                content: [
                    N("hr"),
                    N({style: {color: "gray"}, inner: "We are preparing your environment. A UNIX-like virtual system with bash and a filesystem will be created to integrate with your desktop.<br><br>"}),
                    loadingModalText, N("br"),
                    loadingModalBarElement
                ]
            })

            // When the loading fails
            function fail(error){
                loadingModal.title = "Loading failed"
                loadingModal.content = error
                loadingModalBarElement.remove()
                return false
            }
        
        
            let loadingModalBar = LS.Progress(null, loadingModalBarElement)
            loadingModal.show()

            loadingModalBar.progress += 15
            loadingModalText.set("Downloading & loading virtual OS handles..")

            window.os_initialize = (_os) => {
                os = _os

                os.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            }

            try{
                await M.Script("/assets/os.js?cache=" + os_cacheKey)
            }catch{}

            await os.sleep(244)
            
            if(!os){
                return fail("Virtual OS handles faied to load")
            }

            loadingModalText.set("Loading required modules..")

            try{
                await M.Script("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js")
            }catch{}

            // Modules suck.
            // window.module = {};

            // try{
            //     await M.Script("https://cdn.jsdelivr.net/npm/ini@4.1.1/lib/ini.min.js")
            // }catch{}

            // window.ini = module.exports;

            // os.storage = new JSZip();

            // await os.sleep(157)

            // loadingModalBar.progress += 45
            // loadingModalText.set("Creating a virtual filesystem..")

            // os.env = {
            //     PATH: "/bin:/usr/bin",
            //     LANG: navigator.language,
            //     HOME: "/home/user", // Update later when managing user accounts
            // }

            // os.fs = {
            //     get storage(){
            //         return os.storage
            //     },

            //     supportedEncodings: [...Object.keys(JSZip.support).filter(key => JSZip.support[key]), "binarystring", "url"],

            //     normalizePath(path){
            //         // Replace backslashes with forward slashes
            //         path = path.replace(/\\/g, '/');
                
            //         // Resolve '..' and '.' in the path
            //         const parts = path.split('/');
            //         const normalizedParts = [];
                
            //         for (const part of parts) {
            //             if (part === '..') {
            //                 // Pop the last directory off the stack if '..' encountered
            //                 normalizedParts.pop();
            //             } else if (part !== '.' && part !== '') {
            //                 // Ignore '.' and empty parts
            //                 normalizedParts.push(part);
            //             }
            //         }
                
            //         // Join the parts to form the normalized path
            //         const normalizedPath = normalizedParts.join('/') + (path.endsWith("/")? "/" : "");

            //         return normalizedPath == "/"? "" : normalizedPath;
            //     },

            //     async read(path, encoding = "uint8array"){
            //         path = os.fs.normalizePath(path);

            //         let object = os.fs.get(path);

            //         if(!object) throw path + ": No such file or directory";
            //         if(object.dir) throw object.name + ": Is a directory";

            //         if(object.unixPermissions && object.unixPermissions.toString(8).startsWith("120")){
            //             // The file is a symlink - follow it;

            //             let realPath = os.fs.normalizePath(await object.async("text"));
                        
            //             if(realPath == path) throw path + ": Symlink is looping forever!";
            //             if(!os.fs.exists(realPath)) throw path + ": Broken symlink (pointing to " + realPath + ")";

            //             return os.fs.read(realPath, encoding)
            //         }

            //         if(["ascii", "utf8", "text"].includes(encoding)) encoding = "string";
            //         if(!os.fs.supportedEncodings.includes(encoding)) throw "Unsupported encoding";

            //         let data = await object.async(encoding == "url"? "blob" : encoding);
            //         return encoding == "url"? URL.createObjectURL(data) : data
            //     },

            //     write(path, data){
            //         path = os.fs.normalizePath(path)

            //         os.storage.file(path, data)
            //     },

            //     rm(path){
            //         path = os.fs.normalizePath(path)

            //         os.storage.remove(path)
            //     },

            //     ls(path = "/", options = {}){
            //         path = os.fs.normalizePath(path + "/")

            //         return Object.keys(os.storage.files).filter(found_path => {
            //             found_path = os.fs.normalizePath(found_path);

            //             if(found_path == path) return false;

            //             let contained = found_path.startsWith(path),
            //                 object = os.fs.get(found_path),
            //                 depth = (found_path.split("/").length - (object.dir? 1 : 0)) - path.split("/").length
            //             ;

            //             return contained
            //                     && (options.directories? object.dir : true)
            //                     && (options.recursive? true : depth == 0 )

            //         }).map(thing => {

            //             if(options.fullPath) return "/" + thing;
            //             return thing.replace(path, "")

            //         })
            //     },

            //     exists(path){
            //         let object = os.fs.get(path)

            //         return !!object
            //     },

            //     get(path){
            //         // TODO: Add logic to detect different mount points etc
            //         path = os.fs.normalizePath(path)

            //         if(!os.storage.files[path]){
            //             path = path.endsWith("/")? path.slice(0, -1) : path + "/";
            //         }

            //         return os.storage.files[path];
            //     },

            //     isDirectory(path){
            //         let object = os.fs.get(path)

            //         return object? object.dir : false
            //     },

            //     async patchWithImage(image){
            //         if(image instanceof ArrayBuffer || image instanceof Uint8Array){
            //             os.storage = await os.storage.loadAsync(image, { createFolders: true });
            //         }
            //     },

            //     async export(type = "uint8array"){
            //         return await os.storage.generateAsync({
            //             type,
            //             platform: "UNIX"
            //         })
            //     },

            //     resolve(target, pwd){
            //         if(target.startsWith("/")) return target;

            //         else return "/" + fs.normalizePath(pwd + "/" + target)
            //     },

            //     pathFind(file){
            //         if(file.includes("/")) return file;

            //         for(let path of os.env.PATH.split(":")){
            //             let files = os.fs.ls(path);

            //             if(files && files.includes(file)){
            //                 return "/" + os.fs.normalizePath(path + "/" + file)
            //             }
            //         }

            //         return file;
            //     }
            // }

            // os.std = os.StandardInputOutput() // LEGACY
            // os.std = os.stdio()

            // await os.sleep(175)

            // loadingModalBar.progress += 40
            // loadingModalText.set("Downloading virtual system image..")

            // let image = await(await fetch("/unix/images/os.img?cache=" + os_cacheKey)).arrayBuffer()

            // os.fs.patchWithImage(image)
            
            // await os.sleep(500) // Wait time required so the modal can be closed properly
            loadingModal.hide()
            return true
        })()){
            return
        };

        let logger = {
            log(data){
                logger.push(data, "\n")
            },
            push(...data){
                logContainer.add(...data)
                logContainer.scrollBy(0, logContainer.scrollHeight)
            },
            error(data){
                logger.push(N("span", {inner: data, style: {color: "red"}}), "\n")
            },
            warn(data){
                logger.push(N("span", {inner: data, style: {color: "orange"}}), "\n")
            },
            text(data){
                logger.push(N("span", {textContent: data}))
            },
            clear(){
                logContainer.clear()
            }
        }

        let commandContainer = O("#command"),
            commandWrapper = O("#commandWrapper"),
            completionMenu = O("#completionMenu"),
            commandIcon = O("#commandIcon"),
            completionHint = O("#commandHint"),
            commandInput = O("#commandInput"),
            pointer = O("#commandPointer"),
            selectionHighlight = O("#commandSelection"),
            dragdrop = LS.DragDrop("main", {
                relativeMouse: true,
                animate: true,
                dropPreview: false,
                absoluteX: true,
                absoluteY: true,
                movementOnly: true,
                container: O("#mainWorkspace")
            }),
            fontWidth = 9.6
        ;

        dragdrop.enableDrop(O("#mainWorkspace"))

        // M.on("keypress", event => {
        //     commandInput.focus()
        //     updatePointer()


        //     if(event.key == "Dead"){
        //         // Thank me later
        //         event.preventDefault()
        //     }
        // })

        function getLSStyleLink(){
            return Q("link").find(link => (link.href.startsWith("https://cdn.extragon.cloud") || link.href.startsWith("http://cdn.extragon.test")) && link.href.includes("ls/css"))
        }

        app = {
            logger,
            tabs,
            lstv,
            os,
            dragdrop,

            commandManager: {
                registerCommand(name, options = {}){
                    options._type = "command";
                    
                    app.commands[name] = options
                },
                registerCommandGroup(name, options = {}){
                    app.commands[name] = options
                },
            },

            packageManager: {
                sources: [
                    true? "http://localhost/unix/images/" : "https://home.lstv.space/unix/images/"
                ],

                async get(name){

                    logger.log("Package " + name + " will now attempt to download.");
                    
                    for(let source of app.packageManager.sources){
                        logger.log("Trying source " + source);

                        let result;
                        
                        try{
                            result = await fetch(source + name + ".img?cache=" + M.GlobalID);
                        } catch {}

                        if(result && result.ok && result.status == 200){
                            let image;
                            try{
                                image = await result.arrayBuffer()
                            } catch (e) {
                                logger.error(e.toString())
                            }

                            return image
                        }
                    }
                    
                    logger.error("Package " + name + " was not found from any available source, or a network error occured.");
                },
                
                async install(package){
                    logger.log("Installing " + name);
                    try {
                        await app.os.fs.patchWithImage(package);

                        if(app.os.fs.exists("/.package")){

                            if(app.os.fs.exists("/.package/setup")){
                                logger.log("Running post-installation script");

                                app.os.process("/.package/setup", null, [], {
                                    onstdout({raw}){
                                        logger.log(`[setup] ${raw}`)
                                    },
                                    onstderr({raw}){
                                        logger.error(`[setup] ${raw}`)
                                    }
                                })
                            }

                            app.os.fs.rm("/.package/")
                        }

                        logger.log("<span style=color:green>Done!</span>");
                    } catch {
                        logger.error("Failed to install the package - maybe it is corrupted.")
                    }
                }
            },

            commandInputPWD: "/",

            widgets: {
                list: [],

                globalZIndex: 0,

                create(content = N(), options = {}){

                    options = LS.Util.defaults({
                        frame: true,
                        lsStyle: true,
                        width: 200,
                        height: 200,
                        accent: "blue",
                        style: `* {font-family: Poppins}`
                    }, options)

                    let tools, element = N({
                        class:"draggableWidget" + (options.frame? " frame": ""),
                        style: {
                            width: options.width + "px",
                            height: options.height + "px",
                        },
                        inner: [
                            N({
                                class: "draggableWidgetHandle",
                                inner: '<i class="bi-grip-horizontal"></i>'
                            }),
                            N({
                                class: "draggableWidgetContentContainer",
                                inner: [
                                    N({
                                        class: "draggableWidgetContent"
                                    })
                                ]
                            })
                        ]
                    })

                    let shadow = element.get(".draggableWidgetContent").attachShadow({ mode: 'open' });

                    shadow.appendChild(N("style", options.style));
                    
                    if(options.lsStyle){
                        if(options.lsStyle) shadow.append(N("link", {
                            href: getLSStyleLink().href,
                            rel: "stylesheet"
                        }));

                        content.style.background = "transparent";
                        content.attrAssign({ls: "", "ls-style": "flat", "ls-accent": options.accent})
                    }

                    content.style.width = "100%";
                    content.style.height = "100%";
                    
                    shadow.append(content);

                    // dragdrop.enableDrag(element)
                    let handle = LS.Util.RegisterMouseDrag(element.get(".draggableWidgetHandle"), null, {
                        cursor: "grabbing"
                    });

                    let initialX, initialY, initialBound, prevX, prevY, velocityX, velocityY;

                    handle.on("start", () => {
                        initialX = M.x;            
                        initialY = M.y;
                        initialBound = element.getBoundingClientRect();

                        element.class("is-dragging")
                    })

                    handle.on("move", () => {
                        
                        // let currentBound = element.getBoundingClientRect();

                        let newX = M.x - (initialX - initialBound.left),
                            newY = M.y - (initialY - initialBound.top)
                        ;

                        element.style.left = newX + "px"
                        element.style.top = newY + "px"

                        if(newX !== prevX) {velocityX = ((newX - prevX) / innerWidth) * 1000} else {if(velocityX > 0) {velocityX--} else {velocityX++}}
                        if(newY !== prevY) {velocityY = ((prevY - newY) / innerHeight) * 1000} else {if(velocityY > 0) {velocityY--} else {velocityY++}}

                        element.style.transform = `translate(0, ${velocityY}px) rotate(${velocityX}deg)`

                        prevX = newX
                        prevY = newY
                    })

                    handle.on("end", () => {
                        element.style.transform = "none"
                        element.class("is-dragging", 0)
                    })

                    tools = {
                        element,

                        get x(){
                            return element.getBoundingClientRect().x
                        },

                        get y(){
                            return element.getBoundingClientRect().y
                        },

                        set x(value){
                            if(typeof value !== "number") throw "Invalid value";

                            element.style.left = value + "px"
                        },

                        set y(value){
                            if(typeof value !== "number") throw "Invalid value";

                            element.style.top = value + "px"
                        },

                        focus(){
                            app.widgets.globalZIndex++
                            element.style.zIndex = app.widgets.globalZIndex
                        }
                    }

                    app.widgets.list.push(tools)

                    O("#mainWorkspace").add(element)

                    element.on("mousedown", "touchstart", () => {
                        tools.focus()
                    })

                    tools.focus()

                    return tools
                }
            },

            get completionMenuShown() {
                return completionMenu.style.display !== "none"
            },
            get commandFocused() {
                return commandWrapper.hasClass("focused")
            },
            set commandFocused(bool) {
                commandWrapper.class("focused", bool)
            },

            storage: {
                type: "local",

                types: {
                    local: "local",
                    session: "session",
                    anonymous: "anonymous",
                    cloud: "cloud",
                    account: "account",
                },

                async get(key){
                    return new Promise((resolve, reject) => {
                        switch(app.storage.type){
                            case "local":
                                resolve(localStorage[`fosshome-${key}`])
                            break
                            case "session", "anonymous":
                                resolve(app.storage._session[`temporary-${key}`])
                            break
                        }
                    })
                },

                async set(key, value){
                    return new Promise((resolve, reject) => {
                        switch(app.storage.type){
                            case "local":
                                resolve(localStorage[`fosshome-${key}`] = value)
                            break
                            case "session", "anonymous":
                                resolve(app.storage._session[`temporary-${key}`] = value)
                            break
                        }
                    })
                }
            },
            commands: {
                help: {
                    _type: "command",
                    icon: "bi-question-lg",
                    description: "Basic command help",
        
                    run(){
                        logger.log(`\n<i class=bi-stars></i> Start by typing a command into the command field and then pressing enter.\n\n<i class=bi-list-task></i> To view all top-level commands, press arrow down/up key when the command field is empty.\n\nThree dots ("...") in the autocomplete menu mean that pressing space after typing such command will reveal further options.\n\nTo close this console, simply click away anywhere on the desktop or press escape.`)
                    },
                },
        
                about: {
                    _type: "command",
                    icon: "bi-info-circle-fill",
                    description: "Information about this project",
        
                    run(){
                        createWindow({
                            title: "About",
                            width: 670,
                            height: 600,
                            minWidth: 300
                        }, N("div", {
                            class: "about",
                            inner: [
                                N("img", {src: "/logo.svg", draggable: false, width: "200", style: "transform: translateX(20px);"}),
                                N("h1", "About"),
                                N("span", {style: "text-align: left; display: block;" , inner: `<ls-box class=color ls-accent=orange>Please note that this is an unreleased product, branding or any features might be changed at any point without prior warning.</ls-box>\n\nFOSSHome is an awesome time-saving hub to center all of your ideas!<br>It is an entire \"operating system\" inside of your browser, which together with a virtual filesystem, UNIX-like bash, and a complete application framework create a perfect environment to manage everything at hand.<br>On top of that it is cloud-synced in real time, fully customizable, supports multi-user collaboration, privacy-focused, and most importantly, is Free and Open Source!<br><br>The goal of this project is to make a fast-pace and seamless environment to manage... well, everything from a single place.\n\nThe GUI is mainly controlled with a keyboard via the command input.\n\nCurrently, this is partially implemented:\n<li>Custom window manager and composer</li><li>An application framework to create and integrate 3rd party apps</li><li>Simple package manager to install apps and patches</li><li>Modular command interface</li><li>Command auto-completion and keyboard navigation</li><li>Virtual (local, in-memory) filesystem (UNIX-Style)</li><li>UNIX-like virtual bash</li>`})
                            ]
                        })).addToWorkspace()
                    },
                },

                pkg: {
                    _icon: "bi-backpack4-fill",
                    _description: "Package manager",
        
                    async install(name){
                        // todo: add local packages

                        let image = await app.packageManager.get(name);

                        if(image){
                            await app.packageManager.install(image)
                        }
                        return 0
                    },
                },
        
                gui: {
                    _icon: "bi-window-desktop",
                    _description: "Various builtin GUI applications and tools",
        
                    calculator: {
                        _type: "command",
                        icon: "bi-calculator-fill",
                        description: "Open a GUI calculator",
        
                        run(){
                            createWindow({
                                title: "Calculator",
                                tags: ["acrylic"]
                            }, N("div", {
                                class: "calculator",
                                inner: [
                                    N({
                                        class: "display",
                                    }),
                                    N({
                                        class: "keypad",
                                        inner: [
                                            N("button", {class: "elevated circle", inner: "C"}),
                                            N("button", {class: "elevated circle", inner: "("}),
                                            N("button", {class: "elevated circle", inner: "9"}),
                                            N("button", {class: "elevated circle", inner: "7"}),
                                            N("button", {class: "elevated circle", inner: "8"}),
                                            N("button", {class: "elevated circle", inner: "9"}),
                                            N("button", {class: "elevated circle", inner: "4"}),
                                            N("button", {class: "elevated circle", inner: "5"}),
                                            N("button", {class: "elevated circle", inner: "6"}),
                                            N("button", {class: "elevated circle", inner: "1"}),
                                            N("button", {class: "elevated circle", inner: "2"}),
                                            N("button", {class: "elevated circle", inner: "3"}),
                                            N("button", {class: "elevated circle", inner: "0"})
                                        ]
                                    })
                                ]
                            })).addToWorkspace()
                        },
                    },
        
                    window_manager: {
                        _type: "command",
                        icon: "bi-layout-text-window-reverse",
                        description: "Manage any opened windows",
        
                        run(){
                            createWindow({
                                title: "Calculator",
                                tags: ["acrylic"]
                            }, N("div", {
                                class: "calculator",
                                inner: [
                                ]
                            })).addToWorkspace()
                        },
                    },
                },
        
                open: {
                    _icon: "bi-box-arrow-up-right",
                    _description: "Various shortcuts",
        
                    window: {
                        _type: "command",
                        icon: "bi-window-stack",
                        description: "Open as window",
        
                        run(link){
                            createWindow({
                                title: "External window"
                            }, N("iframe", {
                                src: link
                            })).addToWorkspace()
                        },
                    },
        
                    teams(){
                        open("https://teams.microsoft.com/go#")
                    },
                    lstv(){
                        open("https://beta.lstv.space")
                    },
                    cockpit(){
                        open("https://109.71.252.170:9090/")
                    },
                    adminer(){
                        open("https://adminer.lstv.space/")
                    },
                    discord(){
                        open("https://discord.com/app/")
                    },
                    škola_online(){
                        open("https://www.skolaonline.cz/Aktuality.aspx")
                    },
                    bi(){
                        open("https://icons.getbootstrap.com/")
                    },
                    tetris(){
                        open("https://tetr.io/")
                    },
                    kahoot(){
                        open("https://kahoot.it/")
                    },
                    custom(link){
                        open(link)
                    },
        
                    _after(command){
                        logger.log(`Opened ${command.split(" ")[1]} in a new tab/window.`)
                    }
                },
        
                search: {
                    _type: "command",
        
                    icon: "bi-search",
                    description: "Search the web with Google",
        
                    run(...args){
                        open(`https://www.google.com/search?q=${encodeURIComponent(args.join(" "))}`)
                    }
                },
        
                terminal: {
                    _type: "command",

                    icon: "bi-terminal-fill",
                    alias: ["bash", "cmd"],
                    description: "Open a terminal window with a virtual Linux-like shell",

                    run(pwd){


                        /*
                        
                            This is a simple terminal emulator application using Xterm.JS

                            Of course, you can make your own custom terminal emulator apps, and use this as inspiration.
                        
                        */


                        // Create a window for our terminal
                        
                        let terminalRender = N({
                            class: "rendererContainer"
                        });

                        let terminalWindow = createWindow({

                            title: "Terminal",
                            tags: ["acrylic"],

                            width: 960,
                            height: 540,

                            maxHeight: Infinity,
                            maxWidth: Infinity,

                            onResize(){
                                fit.fit() // Adjust terminal size automatically
                            }

                        }, N("div", {
                            class: "terminal",
                            inner: [
                                terminalRender
                            ]
                        }))


                        // Display the window
                        terminalWindow.addToWorkspace()


                        // Initialize Xterm.JS

                        let term = new Terminal(),
                            fit = new FitAddon.FitAddon()
                        ;
                        
                        window.lastTerm = term;
                        term.loadAddon(fit);
                        term.open(terminalRender);


                        // Standard default bash ("-i" to launch an interactive shell)

                        let bash = os.process('bash', null, ["-i"], {
                            // Push stdout to the terminal

                            onstdout(data){
                                term.write(data)
                            },

                            onstderr(data){
                                term.write(data)
                            },

                            onexit(code){
                                // ...
                                terminalWindow.close()
                            }
                        })


                        // Push stdin to the bash

                        term.onKey(e => {
                            console.log(e);

                            bash.std.in = e.key
                        });


                        fit.fit() // Fit the terminal to the window initialy
                    }
                },

                bash: {
                    _type: "command",
        
                    icon: "bi-terminal",
                    alias: ["run"],
                    description: "Launches a proccess in the UNIX-like core and attach it to the console",

                    run(...args){
                        try{
                            app.os.process(args[0], app.commandInputPWD, args.splice(1), {
                                onstdout(data) {
                                    logger.log(data.formatted || data.raw)
                                },
                                onstderr(data) {
                                    logger.error(data.formatted || data.raw)
                                }
                            })
                        } catch (e) {
                            logger.error(e.toString())
                        }
                    }
                },
        
                js: {
                    _type: "command",
                    
                    icon: "bi-filetype-js",
                    description: "Execute JavaScript directly",
        
                    run(...code){
                        let handle = new Function('console', "return " + code.join(" ")), result;
        
                        try {
                            result = handle(logger); // Pass the logger as the global console object
                        } catch (e) {
                            logger.error(e);
                        }
        
                        logger.log("<span style='color:#ff56ff'><i class='bi-arrow-return-right'></i></span> " + result)
                    }
                },
        
                clear(){
                    logger.clear()
                },
        
                theme: {
                    _description: "Change the app-wide theme prefferences",
                    _icon: "bi-palette-fill",
        
                    light: {
                        _type: "command",
                        icon: "bi-brightness-alt-high-fill",
                        description: "Switch to light theme",
                        run(){
                            LS.Color.setTheme("light")
                        }
                    },
        
                    dark: {
                        _type: "command",
                        icon: "bi-moon-stars-fill",
                        description: "Switch to dark theme",
                        run(){
                            LS.Color.setTheme("dark")
                        }
                    },
        
                    amoled: {
                        _type: "command",
                        icon: "bi-moon-stars",
                        description: "Switch to amoled theme",
                        run(){
                            LS.Color.setTheme("amoled")
                        }
                    },
        
                    accent: {
                        _icon: "bi-droplet-half",
                        _description: "Change preffered color scheme",
                        ...Object.fromEntries(LS.Color.all().map((color, index) => [color, () => LS.Color.setAccent(color)]))
                    }
                }
            }
        }

        function handleCommandInputKey(event){
            if(!event.preventDefault) event.preventDefault = () => {};

            switch(event.key){
                case "Enter":
                    if(app.completionMenuShown) return handleCommandInputKey({key: "Tab"});

                    runCommand(commandInput.value)
                    event.preventDefault()
                break;
                
                case "Dead":
                    // Thank me later
                    
                    commandInput.blur()
                    setTimeout(() => commandInput.focus())
                    event.preventDefault()

                    if(commandInput.value.includes("¨")) commandInput.value = commandInput.value.replaceAll("¨", "")
                break;

                case "ArrowDown":
                    autoCompletionIndex ++
                    autoCompletion(commandInput.value)
                    event.preventDefault()
                break;

                case "ArrowUp":
                    autoCompletionIndex --
                    autoCompletion(commandInput.value)
                    event.preventDefault()
                break;

                case "Escape":
                    if(app.commandFocused){
                        if(app.completionMenuShown) return completionMenu.hide()
                        commandInput.blur()
                        app.commandFocused = false
                    }
                break;

                case "Tab":
                    if(autoCompletionValue) {
                        commandInput.value += autoCompletionValue.replace(commandInput.value.split(" ").at(-1), "") + " "
                        O("#commandText").set(commandInput.value)
                        autoCompletion(commandInput.value)
                        updatePointer()
                    }

                    event.preventDefault()
                    commandInput.focus()
                break;

                default:
                    updatePointer()
            }
        }

        commandInput.on("keydown", handleCommandInputKey)

        .on("keyup", event => {
            updatePointer()

            if(event.key == "Dead"){
                // Thank me later
                
                commandInput.blur()
                setTimeout(() => commandInput.focus())
                event.preventDefault()

                if(commandInput.value.includes("¨")) commandInput.value = commandInput.value.replaceAll("¨", "")
            }
        })

        .on("input", () => {
            updatePointer()
            O("#commandText").set(commandInput.value)

            completionHint.clear()
            autoCompletion(commandInput.value)
        })

        .on("blur", () => {
            commandWrapper.class("focused", false)
            updatePointer()
        })

        .on("focus", () => {
            commandWrapper.class("focused", true)
        })

        let autoCompletionIndex = 0, autoCompletionValue = "";

        function clearAutoCompletion(){
            completionHint.clear()
            autoCompletionValue = ""
            commandIcon.className = "bi-terminal"
            completionMenu.hide()
        }

        function autoCompletion(value){
            clearAutoCompletion()

            let command = (value || "").split(" "), i = -1, completion = [];

            let location = app.commands;
            for(let part of command){
                i++;

                if(i >= command.length -1){
                    let keys = Object.keys(location).filter(item => !item.startsWith("_") && item.startsWith(part) && (location[item]._type == "command"? !location[item].hidden : true));

                    if(autoCompletionIndex < 0) autoCompletionIndex = keys.length - 1;
                    if(autoCompletionIndex > keys.length - 1) autoCompletionIndex = 0;

                    autoCompletionValue = keys[autoCompletionIndex];
                    
                    if(keys.length < 1 || !autoCompletionValue || !location[autoCompletionValue]) break;

                    if(location[autoCompletionValue]._type == "command"){
                        // Setup selected item in autocomplete

                        if(location[autoCompletionValue].icon) commandIcon.className = location[autoCompletionValue].icon;
                    } else {
                        if(location[autoCompletionValue]._icon) commandIcon.className = location[autoCompletionValue]._icon;
                    }

                    completionHint.set(autoCompletionValue.replace(part, ""))

                    completionMenu.style.left = (commandInput.selectionEnd * fontWidth) + "px"

                    completion = keys
                    break
                } else {
                    if(typeof location[part] == "object" && !Array.isArray(location[part]) && location[part]._type !== "command"){
                        location = location[part]
                        continue
                    }
                    break
                }

                if(!location[part]) break;

            }
            
            if(completion){
                let content = completion.filter(item => item.startsWith(command.at(-1))).map((item, index) => {
                    let isConfigurable = location[completion[index]]._type == "command";

                    return N("ls-option", {
                        onclick(){
                            autoCompletionIndex = index
                            return handleCommandInputKey({key: "Tab"})
                        },

                        inner: [

                            N("i", {
                                class: location[completion[index]].icon || location[completion[index]]._icon || "bi-grid-fill"
                            }),

                            N("span", {innerText: item + ((!isConfigurable && typeof location[completion[index]] !== "function")? " ... " : "")}),

                            ((isConfigurable && location[completion[index]].description) || location[completion[index]]._description) ? N("span", {style: {color: "gray"}, innerText: " - " + (location[completion[index]].description || location[completion[index]]._description)}): ""

                        ],

                        class: autoCompletionIndex == index? "selected" : ""
                    })
                })

                if(content.length > 0){
                    completionMenu.show("flex")
                    completionMenu.set(content)
                }
            } else completionMenu.hide().clear()

            return completion;
        }

        async function runCommand(value){
            if(!value) return;

            commandInput.value = null;
            O("#commandText").clear()
            clearAutoCompletion()

            let command = value.split(" "), i = -1;

            let location = app.commands;
            for(let part of command){
                i++;

                if(!location[part]) return logger.error(`Command "${value}" not found`);

                if(typeof location[part] == "object" && !Array.isArray(location[part]) && location[part]._type !== "command"){
                    location = location[part]
                    continue
                }

                if(typeof location[part] == "function" || location[part]._type == "command"){

                    let func = (location[part]._type == "command"? location[part].run : location[part])

                    logger.log("<span style='color:gray'><i class='bi-arrow-left-short'></i> " + value + "</span>");

                    let result = null;
                    if(func) {
                        result = await func(...command.slice(i + 1))

                        if(location._after) location._after(value)
                    }

                    logger.log("<span style='color:gray'><i class='bi-arrow-right-short'></i> Command finished " + (result? `with ${result}` : "") + "</span>");

                    return
                }
            }

            return logger.error(`Command "${value}" not found`);
        }

        app.runCommand = runCommand;
        app.createWindow = createWindow;

        function updatePointer(){
            let selection = commandInput.selectionEnd !== commandInput.selectionStart;

            if(!selection){
                pointer.style.left = (commandInput.selectionEnd * fontWidth) + "px"
            } else {
                selectionHighlight.style.left = (commandInput.selectionStart * fontWidth) + "px"
                selectionHighlight.style.width = ((commandInput.selectionEnd - commandInput.selectionStart) * fontWidth) + "px"
            }

            commandWrapper.class("selection", selection)
        }

        let pointerSwitch = false;
        setInterval(() => {
            pointerSwitch = !pointerSwitch

            pointer.class("blink", pointerSwitch)
        }, 500)


        autoCompletion()



        setTimeout(async ()=>{
            let todo = [
                "Proper stdin/stdout/stderr handles and API in os.js",
                "Make a REAL bash, and remove the fake one from the terminal GUI",
                "Improove widgets (grid snap, better animation, state saving)",
                "More FS options",
                "(maybe) migrate from in-memory JSZip filesystem to a custom one with IndexedDB",
                "Improove shell environment",
                "Improove terminal",
                "SSH & SFTP",
                "A proper package manager",
                "Make Node.JS apps work",
                "Create simulated NodeJS environment with terminal-kit",
                "Port some native NodeJS modules",
                "Port Node.JS",
                "Rewrite os.js to use actual ansii and in general be better",
                "Make a real and proper bash",
                "Make it responsive",
                "Backwards compatibility with a real OS",
                "Complete app framework and premissions",
                "Package manager & custom patch images",
                "File manager GUI",
                "Add missing Linux binaries",
                "Better integration with the VFS",
                "Terminal app",
                "Calculator app",
                "Proccess manager app",
                "Media player app",
            ]

            let content = [];

            let i = -1;
            for(let item of todo){
                i++;

                let index = i;

                content.push(
                    N("label", {
                        class: "ls-checkbox",
                        inner: [
                            item,
                            N("input", {attr: await app.storage.get(`com.lstv.fosshome.widget.todo[${index}]`) == "true"? "checked": null, type: "checkbox", onchange(){
                                console.log(this.checked);
                                app.storage.set(`com.lstv.fosshome.widget.todo[${index}]`, this.checked)
                            }}),
                            N("span")
                        ]
                    })
                )
            }

            app.widgets.create(N([
                N("h1", "To-Do"),
                "This is a sample to-do list widget!<br><br>",
                N({class: "list", inner: content}),
            ]), {
                frame: false,
                width: 420,
                height: 420,
                style: `
            :host {
                background-image: linear-gradient(18deg, #063a6b 0%, #105035 100%);
                padding: 20px;
                width: 100%;
                font-size: .9em;
            }
            
            .list {
                display: flex;
                flex-direction: column;
                gap: 5px;
                background: #000a;
                backdrop-filter: blur(30px);
                border-radius: 20px;
                padding: 10px 15px;
            }
            
            h1,h2,h3,h4{margin: 0 5px}
            `
            }, 500)
        })
    }

    function LSTV (token) {
        let _this;
        return new (class {
            constructor(){
                _this = this;

                this.token = token
        
                this.api = false? "http://api.extragon.test" : "https://api.extragon.cloud"
                this.apiVersion = "2"
            }
        
            async login () {
                let fragment = await _this.get("/auth/me").json()

                if(!fragment || !fragment.success){
                    return false
                }

                localStorage.__lstv = token; // TEMPORARY MEASURE!!!!!!

                _this.fragment = fragment;
                return fragment
            }
        
            fetch(url, options = {}){
                return fetch(url, {
                    ...options,
                    ...url.startsWith(_this.api) && typeof _this.token == "string" ? {
                        headers: {
                            authorization: _this.token,
                            ...options.headers? options.headers : {}
                        }
                    }: {}
                })
            }
        
            get(endpoint, body, options){
                let response;
        
                async function execute(){
                    if(response) return response;
        
                    response = await _this.fetch(endpoint.startsWith("https://")? endpoint : `${_this.api}/v${_this.apiVersion}/${endpoint}`, {
                        ...body? {body: typeof body == "string"? body : JSON.stringify(body)} : {},
                        ...body? {method: "POST"} : {},
                        ...options
                    });
        
                    return response
                }
        
                return {
                    get response(){
                        return response
                    },
        
                    execute,
        
                    async json(){
                        let response;
                        try{
                            response = await (await execute()).json()
                        } catch (e) { console.error(e) }
        
                        return response
                    },
                    async text(){
                        let response;
                        try{
                            response = await (await execute()).text()
                        } catch (e) { console.error(e) }
        
                        return response
                    },
                    async blob(){
                        let response;
                        try{
                            response = await (await execute()).blob()
                        } catch (e) { console.error(e) }
        
                        return response
                    },
                }
            }
        
            post(endpoint, body, options = {}){
                return _this.get(endpoint, body, {
                    method: "POST",
                    ...options
                })
            }
        })
    }

    window.addEventListener("load", () => {
        LS.once("body-available", async () => {
            O("#preload").hide()

            let params = LS.Util.params(), lstv, lstvLogin = false;

            if(params.result){
                if(params.result == "canceled"){
                    LS.Modal.build({
                        title: "Login canceled",
                        content: "You have canceled the login with LSTV.",
                        buttons: [{text: "OK", color: "auto"}]
                    }).show()
                }

                if(params.result == "success" && location.hash){
                    lstvLogin = location.hash.replace("#", "")
                }

                var newURL = location.protocol + "//" + location.host + location.pathname;
                history.replaceState({path:newURL}, '', newURL);
            } else {
                if(localStorage.__lstv){
                    lstvLogin = localStorage.__lstv
                }
            }


            if(lstvLogin){
                LS.Toast.show("Logging-in with LSTV...", {
                    accent: "green",
                    timeout: 1500
                })

                lstv = new LSTV(lstvLogin)
                
                let login = await lstv.login();

                if(!login){
                    LS.Modal.build({
                        title: "Login failed",
                        content: "Login with LSTV failed - provided token is either invalid, expired, or not compatible with this app.",
                        buttons: [{text: "OK", color: "auto"}]
                    }).show()

                    localStorage.__lstv = ""
                    lstv = undefined
                }
            }

            O("#viewport").show()

            tabs = tabs = LS.Tabs("main", O("#viewport"), {
                list: false
            })

            if(lstv) init (lstv);

            // O("#localDeviceButton").on("click", () => {
            //     LS.Modal.build({
            //         title: "Are you sure?",
            //         content: "The app will run in offline mode and all files will stay on this device only.<br>Please note that some apps may not fully work in this mode.<br>You will need to use the FileSystem GUI app to export your data.",
            //         buttons: [{text: "Cancel", color: "auto"}, {text: "Continue", color: "green", onclick(){
            //             init()
            //         }}]
            //     }).show()
            // })
            
            init()
        })
    })
})();