import fab1 from './fab-1'
import fab2 from './fab-2'
import fab3 from './fab-3'
import bottomBar from './bottom-bar'
import snackbar from './snackbar'
import sheet from './sheet'

/* Ordered list + id lookup for the prototypes. */
export const CONFIGS = [fab3, fab2, snackbar, sheet, bottomBar, fab1]

export const CONFIG_BY_ID = Object.fromEntries(CONFIGS.map((c) => [c.id, c]))
