# Icons

The app keeps its own icons until a prompt changes them. Swap the app's icon family only when the theme being applied changes the icon family or style against the active theme, or the batch explicitly accepts a family change. An older handoff's `icons.swap` flag must be true. An unchanged family authorizes nothing, even when the theme names one. Separately accepted per-instance replacements apply at their listed owners; they don't authorize a family-wide swap. Graphical's free catalogs belong to its development package, and the editor previews licensed families from Graphical's servers: exploring a family in the editor doesn't install it or license it.

1. Reuse the app's existing icon dependency, version and wrapper. If the accepted family is missing from its direct production dependencies, add only that family with the project's package manager and version policy: `lucide-react` for Lucide, `@phosphor-icons/react` for Phosphor. Hugeicons Rounded Outline (`stroke-rounded`) is free: add `@hugeicons/react` and `@hugeicons/core-free-icons`, with no license or registry setup. Every other Hugeicons style needs the app's own Pro license: use it when available; otherwise install free Rounded Outline, tell the user that style needs a license and link https://hugeicons.com. Central is licensed: use supplied assets when available; otherwise use Lucide, tell the user Central needs a license, link https://iconists.co and explain how to add it. Lucide's pack supplies outlines only, so when the theme's icon style is filled, as Jelly's is, report that gap rather than claiming filled artwork. Do not rely on the editor's transitive dependency or import its renderer into production. Verify chosen exports against the installed API; report missing glyphs instead of silently upgrading or substituting them. Namespaced selections identify exact vendor glyphs: `lucide:ZoomOut` means `ZoomOut` from `lucide-react`; `phosphor:Acorn` means `Acorn` (or its supported `AcornIcon` alias) from `@phosphor-icons/react`.
2. For each listed replacement, replace the app's icon (`from`) with `component` from `package`. `from` is the component the app renders today (`XMarkIcon`, `FiHome`, `lucide-x`, or an app component such as `TrashIcon`).
3. For every other icon in a family swap, match names with the table below. Normalize the source name first: drop library prefixes (`Fi`, `Hi`, `Md`, `Io`, `Tb`, `Pi`, `Icon`, …) and suffixes (`Icon`, `Outline`, `Solid`, `Fill`, sizes and digits), then split words.
4. Keep each usage's size, class names, color, stroke props, `aria-*` attributes and refs. Lucide and Phosphor accept `size`, `className` and `strokeWidth` (Phosphor uses `weight`).
5. Leave unmatched icons, logos and illustrations as they are, and list the unmatched icons in your report.

Rewrite imports at the source of truth: when the app wraps icons (an `icons/` folder or a shared `Icon` component), change the wrapper rather than every call site.

| Semantic | Lucide | Phosphor | Recognized names |
| --- | --- | --- | --- |
| home | House | House | home, house |
| folder | Folder | Folder | folder |
| team | UsersRound | Users | users, user group, team, people, group, participants |
| settings | Settings | Gear | settings, gear, cog, cog tooth, cog 6 tooth, cog 8 tooth, preferences |
| inboxTray | Inbox | Tray | inbox, tray, inbox stack |
| shoppingBag | ShoppingBag | ShoppingBag | shopping bag, bag, shopping |
| gift | Gift | Gift | gift, present |
| creditCard | CreditCard | CreditCard | credit card, card, payment, billing |
| award | Award | Medal | award, trophy, medal, badge |
| pause | Pause | Pause | pause, player pause |
| play | Play | Play | play, player play |
| bookmark | Bookmark | BookmarkSimple | bookmark, saved |
| arrowRight | ArrowRight | ArrowRight | arrow right, arrow forward, right arrow, arrow narrow right |
| archive | Archive | Archive | archive, archive box |
| inbox | ArrowDownToLine | ArrowLineDown | arrow down to line, arrow line down, arrow bar to down |
| adjust | SlidersHorizontal | SlidersHorizontal | adjustments, adjustments horizontal, sliders, sliders horizontal, tune, options |
| document | FileText | FileText | document, document file text, description, notes, article, page |
| search | Search | MagnifyingGlass | search, magnifying glass, magnifier, find, zoom |
| paperclip | Paperclip | Paperclip | paperclip, paper clip, attachment, attach |
| bell | Bell | Bell | bell, notification, notifications, alert |
| trash | Trash2 | Trash | trash, delete, bin, trash can, remove |
| stamp | Stamp | Stamp | stamp |
| globe | Globe | Globe | globe, world, language, globe alt, earth, public |
| pencil | Pencil | PencilSimple | pencil, edit, pencil square, pen, write, create |
| mailbox | Mailbox | Mailbox | mailbox |
| panelLeft | PanelLeft | SidebarSimple | panel left, sidebar, layout sidebar, sidebar simple, bars 3 |
| check | Check | Check | check, checkmark, done, tick, check circle |
| chevronDown | ChevronDown | CaretDown | chevron down, caret down, angle down, expand more, chevron up down, mini chevron down |
| chevronLeft | ChevronLeft | CaretLeft | chevron left, caret left, angle left, arrow back ios, navigate before |
| chevronRight | ChevronRight | CaretRight | chevron right, caret right, angle right, arrow forward ios, navigate next |
| minus | Minus | Minus | minus, subtract, remove line, dash |
| plus | Plus | Plus | plus, add, new, create new, plus small |
| close | X | X | x, x mark, close, times, cross, dismiss, cancel |
| info | Info | Info | info, information, information circle, info circle |
| bold | Bold | TextB | bold, text b, format bold |
| italic | Italic | TextItalic | italic, text italic, format italic |
| underline | Underline | TextUnderline | underline, text underline, format underlined |
| copy | Copy | Copy | copy, duplicate, document duplicate, clipboard, content copy |
| download | Download | DownloadSimple | download, arrow down tray, download simple, cloud download |
| filePlus | FilePlus | FilePlus | file plus, document plus, file add, note add |
| folderOpen | FolderOpen | FolderOpen | folder open |
| printer | Printer | Printer | printer, print |
| save | Save | FloppyDisk | save, floppy disk, floppy |
| undo | Undo2 | ArrowCounterClockwise | undo, arrow uturn left |
| redo | Redo2 | ArrowClockwise | redo, arrow uturn right |
| arrowUp | ArrowUp | ArrowUp | arrow up, arrow upward, arrow narrow up |
| calendarPlus | CalendarPlus | CalendarPlus | calendar plus, calendar add, event add |
| calendarDays | CalendarDays | CalendarBlank | calendar, calendar days, calendar blank, event, date, calendar today |
| mapPin | MapPin | MapPin | map pin, location, pin, place, location marker |
| tag | Tag | Tag | tag, label, price tag |
| package | Package | Package | package, box, cube, parcel, inventory |
| truck | Truck | Truck | truck, delivery, shipping, local shipping |
| listOrdered | ListOrdered | ListNumbers | list ordered, numbered list numbers, format list numbered |
| loader | LoaderCircle | CircleNotch | loader, spinner, loading, circle notch, loader circle |
| timer | Timer | Timer | timer, stopwatch, schedule, history |
| bookOpen | BookOpen | BookOpen | book open, book, docs, documentation, menu book |
| checkCheck | CheckCheck | Checks | check check, checks, done all, double check |
| shieldCheck | ShieldCheck | ShieldCheck | shield check, shield, security, verified, verified user |
| trendingUp | TrendingUp | TrendUp | trending up, trend up, arrow trending up, chart line up |
| atSign | AtSign | At | at sign, at, mention |
| link | Link2 | Link | link, chain link |
| more | MoreHorizontal | DotsThree | more, more horizontal, ellipsis, dots three |
| sparkles | Sparkles | Sparkle | sparkles, sparkle, insights |
| lightning | Zap | Lightning | zap, lightning, automation |
| buildings | Building2 | Buildings | building, buildings, company, companies |
| clock | Clock3 | Clock | clock, time |
| volume | Volume2 | SpeakerHigh | volume, speaker high, audio |
| volumeOff | VolumeX | SpeakerX | volume x, volume off, speaker x, mute |
| rotateLeft | RotateCcw | ArrowCounterClockwise | rotate ccw, rotate left, arrow counter clockwise |
| rotateRight | RotateCw | ArrowClockwise | rotate cw, rotate right, arrow clockwise |
| user | User | User | user, person, profile, account, user round, user circle |
| userPlus | UserPlus | UserPlus | user plus, user add, add user, invite |
| mail | Mail | Envelope | mail, envelope, email |
| send | Send | PaperPlaneTilt | send, paper plane, paper plane tilt, sent |
| message | MessageSquare | ChatCircle | message, message square, message circle, chat, chat circle, comment, comments |
| file | File | File | file, file blank |
| camera | Camera | Camera | camera |
| image | Image | Image | image, images, photo, picture |
| video | Video | VideoCamera | video, video camera, film |
| arrowLeft | ArrowLeft | ArrowLeft | arrow left, back |
| lock | Lock | Lock | lock, lock keyhole, locked, padlock, lock closed |
| unlock | LockOpen | LockOpen | unlock, lock open, lock keyhole open, unlocked |
| key | Key | Key | key, key round, password |
| eye | Eye | Eye | eye, view, show, visible |
| eyeOff | EyeOff | EyeSlash | eye off, eye slash, hide, hidden, view off |
| star | Star | Star | star |
| heart | Heart | Heart | heart, favorite, favourite, like |
| arrowDown | ArrowDown | ArrowDown | arrow down |
| share | Share2 | ShareNetwork | share, share network |
| upload | Upload | UploadSimple | upload, upload simple, arrow up tray |
| cloudUpload | CloudUpload | CloudArrowUp | cloud upload, cloud arrow up |
| cloud | Cloud | Cloud | cloud |
| externalLink | ExternalLink | ArrowSquareOut | external link, arrow square out, open in new, link external, arrow top right on square |
| filter | ListFilter | Funnel | filter, funnel, list filter |
| sort | ArrowUpDown | ArrowsDownUp | sort, arrow up down, arrows up down, arrows down up |
| menu | Menu | List | menu, hamburger, bars |
| grid | LayoutGrid | SquaresFour | grid, layout grid, squares four, apps, view grid |
| list | List | ListBullets | list, list bullets, view list, rows |
| table | Table2 | Table | table, table cells |
| database | Database | Database | database, circle stack |
| server | Server | HardDrives | server, hard drives, server stack |
| code | Code | Code | code, code bracket, code xml, brackets |
| terminal | Terminal | Terminal | terminal, command line |
| chart | ChartColumn | ChartBar | chart, chart column, chart bar, bar chart, analytics |
| pieChart | ChartPie | ChartPie | pie chart, chart pie |
| activity | Activity | Pulse | activity, pulse |
| dollar | DollarSign | CurrencyDollar | dollar, dollar sign, currency dollar, money |
| receipt | Receipt | Receipt | receipt, invoice, bill |
| chevronUp | ChevronUp | CaretUp | chevron up, caret up |
| alertTriangle | TriangleAlert | Warning | triangle alert, alert triangle, warning, exclamation triangle |
| alertCircle | CircleAlert | WarningCircle | circle alert, alert circle, warning circle, exclamation circle, error |
| help | CircleQuestionMark | Question | help, circle help, circle question mark, question, question mark circle |
| refresh | RefreshCw | ArrowsClockwise | refresh, refresh cw, arrows clockwise, sync, reload, arrow path |
| logOut | LogOut | SignOut | log out, logout, sign out |
| logIn | LogIn | SignIn | log in, login, sign in |
| sun | Sun | Sun | sun, light mode |
| moon | Moon | Moon | moon, dark mode |
| hash | Hash | Hash | hash, hashtag, number sign |
| type | Type | TextT | type, text t, text, case sensitive, text font |
| phone | Phone | Phone | phone, call, telephone |
