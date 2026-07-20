import fab1 from './fab-1'
import fab2 from './fab-2'
import fab3 from './fab-3'
import bottomBar from './bottom-bar'
import sheet from './sheet'

/* Ordered list + id lookup for the five prototypes. */
export const CONFIGS = [fab1, fab2, fab3, bottomBar, sheet]

export const CONFIG_BY_ID = Object.fromEntries(CONFIGS.map((c) => [c.id, c]))
