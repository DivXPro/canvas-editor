export interface Global {
  /** a string uniquely identifying this node within the document */
  id: string
  /** the name given to the node by the user in the tool. */
  name: string
  /** whether or not the node is visible on the canvas */
  visible?: boolean
  /** the type of the node, refer to table below for details */
  type: NodeType
  /** data written by plugins that is visible only trotationo the plugin that wrote it. Requires the `pluginData` to include the ID of the plugin. */
  pluginData?: any
  /** data written by plugins that is visible to all plugins. Requires the `pluginData` parameter to include the string "shared". */
  sharedPluginData?: any
}

export interface NodeBase extends Global {
  type: NodeType
  /**
   * Width and height of element. This is different from the width and height
   * of the bounding box in that the absolute bounding box represents the
   * element after scaling and rotation. Only present if geometry=paths
   * is passed
   */
  size: Size
  /**
   * x and y of element. This is different from the x and y
   * of the bounding box in that the absolute bounding box represents the
   * element after scaling and rotation. Only present if geometry=paths
   * is passed
   */
  position: Position
  rotation?: number
  /**
   * An array of fill paints applied to the node
   * @default []
   */
  fills?: Array<Paint>
  /**
   * An array of stroke paints applied to the node
   * @default []
   */
  strokes?: Array<Paint>
  /** The weight of strokes on the node */
  strokeWeight?: number
  /**
   * Position of stroke relative to vector outline, as a string enum
   * "INSIDE": stroke drawn inside the shape boundary
   * "OUTSIDE": stroke drawn outside the shape boundary
   * "CENTER": stroke drawn centered along the shape boundary
   */
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER'
  /**
   * An array of effects attached to this node
   * (see effects sectionfor more details)
   * @default []
   */
  effects?: Array<Effect>
  /**
   * Does this node mask sibling nodes in front of it?
   * @default false
   */
  isMask?: boolean
  visable?: boolean
  /** Bounding box of the node in absolute space coordinates */
  absoluteBoundingBox?: Rect
  /**
   * How this node blends with nodes behind it in the scene
   * (see blend mode section for more details)
   */
  blendMode?: BlendMode
  locked?: boolean
}

/**
 * Styles can be one of the following types
 */
export type StyleType = 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'

/**
 * the above styles can be used in the following ways
 */
export type StyleKeyType = 'fill' | 'stroke' | 'effect' | 'grid' | 'text' | 'background'

export type StylesObject = {
  [key in StyleKeyType]: Record<key, string>
}[StyleKeyType]

export type ScaleMode = 'FILL' | 'FIT' | 'TILE' | 'STRETCH'

export type PaintTypeSolid = 'SOLID'

export type PaintTypeGradient = 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND'

export type PaintTypeImage = 'IMAGE' | 'EMOJI' // I'm guessing that EMOJI is like an image, not sure where it is used

export type TextType = 'TEXT'

export type PaintType = PaintTypeSolid | PaintTypeGradient | PaintTypeImage

/**
 * how the layer blends with layers below
 */
export type BlendMode =
  | 'PASS_THROUGH' /** (Only applicable to objects with children) */
  | 'NORMAL'

  /** Darken: */
  | 'DARKEN'
  | 'MULTIPLY'
  | 'LINEAR_BURN'
  | 'COLOR_BURN'

  /** Lighten: */
  | 'LIGHTEN'
  | 'SCREEN'
  | 'LINEAR_DODGE'
  | 'COLOR_DODGE'

  /** Contrast: */
  | 'OVERLAY'
  | 'SOFT_LIGHT'
  | 'HARD_LIGHT'

  /** Inversion: */
  | 'DIFFERENCE'
  | 'EXCLUSION'

  /** Component: */
  | 'HUE'
  | 'SATURATION'
  | 'COLOR'
  | 'LUMINOSITY'

export type EasingType =
  | 'EASE_IN' /** Ease in with an animation curve similar to CSS ease-in */
  | 'EASE_OUT' /** Ease out with an animation curve similar to CSS ease-out */
  | 'EASE_IN_AND_OUT' /** Ease in and then out with an animation curve similar to CSS ease-in-out */

export type RoleType = 'viewer' | 'editor' | 'owner'

export enum ResizeHandle {
  TopLeft = 'topLeft',
  Top = 'top',
  TopRight = 'topRight',
  Right = 'right',
  BottomRight = 'bottomRight',
  Bottom = 'bottom',
  BottomLeft = 'bottomLeft',
  Left = 'left',
}

export type NodeType =
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'VECTOR'
  | 'BOOLEAN_OPERATION'
  | 'STAR'
  | 'LINE'
  | 'ELLIPSE'
  | 'REGULAR_POLYGON'
  | 'RECTANGLE'
  | 'TEXT'
  | 'SLICE'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE'

export type Nodes =
  | Canvas
  | Frame
  | Group
  | Vector
  | BooleanOperation
  | Star
  | Line
  | Ellipse
  | RegularPolygon
  | Rectangle
  | Text
  | Slice
  | Component
  | ComponentSet
  | Instance

/** Node Properties */

/** The root node */
export interface Document extends Global {
  type: 'DOCUMENT'
  /** An array of canvases attached to the document */
  children: Array<Nodes>
}

/** Represents a single page */
export interface Canvas extends Global {
  type: 'CANVAS'
  /** An array of top level layers on the canvas */
  children: Array<NodeBase>
  /** Background color of the canvas */
  backgroundColor: Color
  /** Node ID that corresponds to the start frame for prototypes */
  prototypeStartNodeID: string | null
  /** An array of export settings representing images to export from the canvas */
  exportSettings?: Array<ExportSetting>
}

export interface FrameBase extends NodeBase {
  /** An array of nodes that are direct children of this node */
  children: Array<NodeBase>
  /** Background of the node. This is deprecated, as backgrounds for frames are now in the fills field. */
  background?: Array<Paint>
  /** Background color of the node. This is deprecated, as frames now support more than a solid color as a fills. Please use the fills field instead. */
  backgroundColor: Color

  /**
   * Radius of each corner of the frame if a single radius is set for all
   * corners
   */
  cornerRadius?: number
  /**
   * Array of length 4 of the radius of each corner of the frame, starting
   * in the top left and proceeding clockwise
   */
  rectangleCornerRadii?: [number, number, number, number]
  /**
   * An array of export settings representing images to export from node
   * @default []
   */
  exportSettings?: Array<ExportSetting>

  /**
   * Keep height and width constrained to same ratio
   * @default false
   */
  preserveRatio?: boolean
  /** Horizontal and vertical layout constraints for node */
  constraints?: LayoutConstraint
  /**
   * How the layer is aligned inside an auto-layout frame. This property
   * is only provided for direct children of auto-layout frames.
   * MIN
   * CENTER
   * MAX
   * STRETCH
   * In horizontal auto-layout frames, "MIN" and "MAX" correspond to
   * "TOP" and "BOTTOM". * In vertical auto-layout frames, "MIN" and
   * "MAX" correspond to "LEFT" and "RIGHT".
   */
  layoutAlign?: string
  /**
   * Node ID of node to transition to in prototyping
   * @default null
   */
  transitionNodeID?: string | null
  /**
   * The duration of the prototyping transition on this node (in milliseconds)
   * @default null
   */
  transitionDuration?: number | null
  /**
   * The easing curve used in the prototyping transition on this node
   * @default null
   */
  transitionEasing?: EasingType | null
  /**
   * Opacity of the node
   * @default 1
   */
  opacity?: number

  /**
   * The top two rows of a matrix that represents the 2D transform of this
   * node relative to its parent. The bottom row of the matrix is implicitly
   * always (0, 0, 1). Use to transform coordinates in geometry.
   * Only present if geometry=paths is passed
   */
  relativeTransform?: Transform

  /** Does this node clip content outside of its bounds? */
  clipsContent: boolean
  /**
   * Whether this layer uses auto-layout to position its children.
   * @default NONE
   */
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
  /**
   * Whether the counter axis has a fixed length (determined by the user)
   * or an automatic length (determined by the layout engine).
   * This property is only applicable for auto-layout frames
   * @default AUTO
   */
  primaryAxisSizingMode?: 'FIXED' | 'AUTO'
  /**
   * When autolayout is enabled
   */
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
  /**
   * When autolayout is enabled
   */
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX'
  /**
   * When autolayout is enabled
   */
  paddingLeft?: number
  /**
   * The padding betweeen the left border of the frame and its children.
   * This property is only applicable for auto-layout frames.
   * @default 0
   */
  paddingRight?: number
  /**
   * The padding betweeen the right border of the frame and its children.
   * This property is only applicable for auto-layout frames.
   * @default 0
   */
  paddingTop?: number
  /**
   * The padding betweeen the top border of the frame and its children.
   * This property is only applicable for auto-layout frames.
   * @default 0
   */
  paddingBottom?: number
  /**
   * The padding betweeen the bottom border of the frame and its children.
   * This property is only applicable for auto-layout frames.
   * @default 0
   */
  counterAxisSizingMode?: 'FIXED' | 'AUTO'
  /**
   * The horizontal padding between the borders of the frame and its
   * children. This property is only applicable for auto-layout frames.
   * @default 0
   */
  horizontalPadding?: number
  /**
   * The vertical padding between the borders of the frame and its
   * children. This property is only applicable for auto-layout frames.
   * @default 0
   */
  verticalPadding?: number
  /**
   * The distance between children of the frame. This property is only
   * applicable for auto-layout frames.
   * @default 0
   */
  itemSpacing?: number
  /**
   * An array of layout grids attached to this node (see layout grids section
   * for more details). GROUP nodes do not have this attribute
   * @default []
   */
  layoutGrids?: Array<LayoutGrid>
  /**
   * Defines the scrolling behavior of the frame, if there exist contents
   * outside of the frame boundaries. The frame can either scroll
   * vertically, horizontally, or in both directions to the extents of the
   * content contained within it. This behavior can be observed in a
   * prototype.
   * HORIZONTAL_SCROLLING
   * VERTICAL_SCROLLING
   * HORIZONTAL_AND_VERTICAL_SCROLLING
   * @default NONE
   */
  overflowDirection?: string
}

/** A node of fixed size containing other nodes */
export interface Frame extends FrameBase {
  type: 'FRAME'
}

/** A logical grouping of nodes */
export interface Group extends FrameBase {
  type: 'GROUP'
}

export interface VectorBase extends NodeBase {
  /**
   * An array of export settings representing images to export from node
   * @default []
   */
  exportSettings?: Array<ExportSetting>
  /**
   * Keep height and width constrained to same ratio
   * @default false
   */
  preserveRatio?: boolean
  /**
   * Horizontal and vertical layout constraints for node
   */
  constraints?: LayoutConstraint
  /**
   * Node ID of node to transition to in prototyping
   * @default null
   */
  transitionNodeID?: string | null
  /**
   * The duration of the prototyping transition on this node (in milliseconds)
   * @default null
   */
  transitionDuration?: number | null
  /**
   * The easing curve used in the prototyping transition on this node
   * @default null
   */
  transitionEasing?: EasingType | null
  /**
   * Opacity of the node
   * @default 1
   */
  opacity?: number

  /**
   * The top two rows of a matrix that represents the 2D transform of this
   * node relative to its parent. The bottom row of the matrix is implicitly
   * always (0, 0, 1). Use to transform coordinates in geometry.
   * Only present if geometry=paths is passed
   */
  relativeTransform?: Transform

  /**
   * Only specified if parameter geometry=paths is used. An array of paths
   * representing the object fill
   */
  fillGeometry?: Array<Path>

  /**
   * Only specified if parameter geometry=paths is used. An array of paths
   * representing the object stroke
   */
  strokeGeometry?: Array<Path>

  /**
   * Styles this node uses from the global `styles`
   */
  styles?: StylesObject
}

/** A vector network, consisting of vertices and edges */
export interface Vector extends VectorBase {
  type: 'VECTOR'
}

/** A group that has a boolean operation applied to it */
export interface BooleanOperation extends VectorBase {
  type: 'BOOLEAN_OPERATION'
  /**
   * A string enum with value of "UNION", "INTERSECT", "SUBTRACT", or "EXCLUDE"
   * indicating the type of boolean operation applied
   */
  booleanOperation: 'UNION' | 'INTERSECT' | 'SUBTRACT' | 'EXCLUDE'
  /** An array of nodes that are being boolean operated on */
  children: Array<NodeBase>
}

/** A regular star shape */
export interface Star extends VectorBase {
  type: 'STAR'
}

/** A straight line */
export interface Line extends VectorBase {
  type: 'LINE'
}

/** An ellipse */
export interface Ellipse extends VectorBase {
  type: 'ELLIPSE'
}

/** A regular n-sided polygon */
export interface RegularPolygon extends VectorBase {
  type: 'REGULAR_POLYGON'
}

/** A rectangle */
export interface Rectangle extends VectorBase {
  type: 'RECTANGLE'
  /** Radius of each corner of the rectangle if a single radius is set for all corners */
  cornerRadius?: number
  /** Array of length 4 of the radius of each corner of the rectangle, starting in the top left and proceeding clockwise */
  rectangleCornerRadii?: [number, number, number, number]
}

/** A text box */
export interface Text extends VectorBase {
  type: TextType
  /** Text contained within text box */
  characters: string
  /**
   * Style of text including font family and weight (see type style
   * section for more information)
   */
  style: TypeStyle
  /**
   * Array with same number of elements as characeters in text 'box' |    * each element is a reference to the styleOverrideTable defined
   * below and maps to the corresponding character in the characters
   * field. Elements with value 0 have the default type style
   */
  characterStyleOverrides?: Array<number>
  /** Map from ID to TypeStyle for looking up style overrides */
  styleOverrideTable?: { [index: number]: TypeStyle }
}

/** A rectangular region of the canvas that can be exported */
export interface Slice extends NodeBase {
  type: 'SLICE'
  /** An array of export settings representing images to export from this node */
  exportSettings: Array<ExportSetting>
  /**
   * The top two rows of a matrix that represents the 2D transform of this
   * node relative to its parent. The bottom row of the matrix is implicitly
   * always (0, 0, 1). Use to transform coordinates in geometry.
   * Only present if geometry=paths is passed
   */
  relativeTransform?: Transform
}

/** A node that can have instances created of it that share the same properties */
export interface Component extends FrameBase {
  type: 'COMPONENT'
}

/** A node that can have multiple component variations */
export interface ComponentSet extends FrameBase {
  type: 'COMPONENT_SET'
}

/**
 * An instance of a component, changes to the component result in the same
 * changes applied to the instance
 */
export interface Instance extends FrameBase {
  type: 'INSTANCE'
  /**
   * ID of component that this instance came from, refers to components
   * table (see endpoints section below)
   */
  componentId: string
}

// Types

/** An RGBA color */
export interface Color {
  /** Red channel value, between 0 and 1 */
  r: number
  /** Green channel value, between 0 and 1 */
  g: number
  /** Blue channel value, between 0 and 1 */
  b: number
  /** Alpha channel value, between 0 and 1 */
  a: number
}

/** Format and size to export an asset at */
export interface ExportSetting {
  /** File suffix to append to all filenames */
  suffix: string
  /** Image type, string enum */
  format: 'JPG' | 'PNG' | 'SVG' | 'PDF'
  /** Constraint that determines sizing of exported asset */
  constraint: Constraint
}

/** Sizing constraint for exports */
export interface Constraint {
  /**
   * Type of constraint to apply; string enum with potential values below
   * "SCALE": Scale by value
   * "WIDTH": Scale proportionally and set width to value
   * "HEIGHT": Scale proportionally and set height to value
   */
  type: 'SCALE' | 'WIDTH' | 'HEIGHT'
  /** See type property for effect of this field */
  value: number
}

/** A rectangle that expresses a bounding box in absolute coordinates */
export interface Rect {
  /** X coordinate of top left corner of the rectangle */
  x: number
  /** Y coordinate of top left corner of the rectangle */
  y: number
  /** Width of the rectangle */
  width: number
  /** Height of the rectangle */
  height: number
}

/** Layout constraint relative to containing Frame */
export interface LayoutConstraint {
  /**
   * Vertical constraint as an enum
   * "TOP": Node is laid out relative to top of the containing frame
   * "BOTTOM": Node is laid out relative to bottom of the containing frame
   * "CENTER": Node is vertically centered relative to containing frame
   * "TOP_BOTTOM": Both top and bottom of node are constrained relative to containing frame (node stretches with frame)
   * "SCALE": Node scales vertically with containing frame
   */
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE'
  /**
   * Horizontal constraint as an enum
   * "LEFT": Node is laid out relative to left of the containing frame
   * "RIGHT": Node is laid out relative to right of the containing frame
   * "CENTER": Node is horizontally centered relative to containing frame
   * "LEFT_RIGHT": Both left and right of node are constrained relative to containing frame (node stretches with frame)
   * "SCALE": Node scales horizontally with containing frame
   */
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE'
}

/** Guides to align and place objects within a frame */
export interface LayoutGrid {
  /**
   * Orientation of the grid as a string enum
   * "COLUMNS": Vertical grid
   * "ROWS": Horizontal grid
   * "GRID": Square grid
   */
  pattern: 'COLUMNS' | 'ROWS' | 'GRID'
  /** Width of column grid or height of row grid or square grid spacing */
  sectionSize: number
  /** Is the grid currently visible? */
  visible: boolean
  /** Color of the grid */
  color: Color
  /**
   * Positioning of grid as a string enum
   * "MIN": Grid starts at the left or top of the frame
   * "MAX": Grid starts at the right or bottom of the frame
   * "CENTER": Grid is center aligned
   */
  alignment: 'MIN' | 'MAX' | 'CENTER'
  /** Spacing in between columns and rows */
  gutterSize: number
  /** Spacing before the first column or row */
  offset: number
  /** Number of columns or rows */
  count: number
}

/** A visual effect such as a shadow or blur */
export interface Effect {
  /** Type of effect as a string enum */
  type: 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  /** Is the effect active? */
  visible: boolean
  /** Radius of the blur effect (applies to shadows as well) */
  radius: number

  // The following properties are for shadows only:
  color?: Color
  blendMode?: BlendMode
  offset?: Position
}

/** A solid color, gradient, or image texture that can be applied as fills or strokes */
export interface Paint {
  /** Type of paint as a string enum */
  type: PaintType
  /**
   * Is the paint enabled?
   * @default true
   */
  visible?: boolean
  /**
   * Overall opacity of paint (colors within the paint can also have opacity
   * values which would blend with this)
   * @default 1
   */
  opacity?: number
  // for solid paints
  /** Solid color of the paint */
  color?: Color
  /**
   * How this node blends with nodes behind it in the scene
   * (see blend mode section for more details)
   */
  blendMode?: BlendMode
  // for gradient paints
  /**
   * This field contains three vectors, each of which are a position in
   * normalized object space (normalized object space is if the top left
   * corner of the bounding box of the object is (0, 0) and the bottom
   * right is (1,1)). The first position corresponds to the start of the
   * gradient (value 0 for the purposes of calculating gradient stops),
   * the second position is the end of the gradient (value 1), and the
   * third handle position determines the width of the gradient (only
   * relevant for non-linear gradients).
   *
   */
  gradientHandlePositions?: Array<Position>
  /**
   * Positions of key points along the gradient axis with the colors
   * anchored there. Colors along the gradient are interpolated smoothly
   * between neighboring gradient stops.
   */
  gradientStops?: Array<ColorStop>

  // for image paints

  /** Image scaling mode */
  scaleMode?: ScaleMode
  /**
   * Affine transform applied to the image, only present if scaleMode is `STRETCH`
   */
  imageTransform?: Transform
  /**
   * Amount image is scaled by in tiling, only present if scaleMode is `TILE`
   */
  scalingFactor?: number
  /**
   * A reference to an image embedded in the file. To download the image using this reference,
   * use the GET file images endpoint to retrieve the mapping from image references to image URLs
   */
  imageRef?: string
  /**
   * A reference to the GIF embedded in this node, if the image is a GIF.
   * To download the image using this reference,
   * use the GET file images endpoint to retrieve the mapping from image references to image URLs
   */
  gifRef?: string
}

export interface Path {
  /** A sequence of path commands in SVG notation */
  path: string
  /** Winding rule for the path */
  windingRule: 'EVENODD' | 'NONZERO'
}

export type Transform = ReadonlyArray<ReadonlyArray<number>>

/** A 2d vector */
export interface Position {
  /** X coordinate of the vector */
  x: number
  /** Y coordinate of the vector */
  y: number
}

export interface Size {
  /** X coordinate size of the vector */
  width: number
  /** Y coordinate size of the vector */
  height: number
}

/** A position color pair representing a gradient stop */
export interface ColorStop {
  /** Value between 0 and 1 representing position along gradient axis */
  position: number
  /** Color attached to corresponding position */
  color: Color
}

/** Metadata for character formatting */
export interface TypeStyle {
  /** Font family of text (standard name) */
  fontFamily?: string
  /** PostScript font name */
  fontPostScriptName?: string
  /** Space between paragraphs in px, 0 if not present */
  paragraphSpacing?: number
  /** Paragraph indentation in px, 0 if not present */
  paragraphIndent?: number
  /** Is text italicized? */
  italic?: boolean
  /** Numeric font weight */
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  /** Font size in px */
  fontSize: number
  /** Horizontal text alignment as string enum */
  textAlignHorizontal?: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED'
  /** Vertical text alignment as string enum */
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM'
  /** Space between characters in px */
  letterSpacing?: number
  /** Paints applied to characters */
  fills?: Array<Paint>
  /** Line height in px */
  lineHeightPx?: number
  /** Line height as a percentage of normal line height */
  lineHeightPercent?: number
  /** The unit of the line height value specified by the user. */
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%'
  /** Text casing applied to the node, default is the original casing */
  textCase?: 'UPPER' | 'LOWER' | 'TITLE'
  /** Text decoration applied to the node, default is none */
  textDecoration?: 'STRIKETHROUGH' | 'UNDERLINE'
  /** Line height as a percentage of the font size. Only returned when lineHeightPercent is not 100. */
  lineHeightPercentFontSize?: number
}

/**
 * A description of a master component. Helps you identify which component
 * instances are attached to
 */
export interface ComponentMetadata {
  /** The unique identifier of the element */
  key: string
  /** The name of the element */
  name: string
  /** The description of the element as entered in the editor */
  description: string
}

export interface FrameInfo {
  /** Id of the frame node within the figma file */
  node_id: string
  /** The name of the frame */
  name: string
  /** Background color of the frame */
  background_color: string
  /** Id of the frame's residing page */
  page_id: string
  /** Name of the frame's residing page */
  page_name: string
}

interface SharedElement extends ComponentMetadata {
  /** The unique identifier of the figma file which contains the element */
  file_key: string
  /** Id of the component node within the figma file */
  node_id: string
  /** URL link to the element's thumbnail image */
  thumbnail_url: string
  /** The UTC ISO 8601 time at which the element was created */
  created_at: string
  /** The UTC ISO 8601 time at which the element was updated */
  updated_at: string
  /** The user who last updated the element */
  user: User
}

/**
 * An arrangement of published UI elements that can be instantiated across figma files
 */
export interface FullComponentMetadata extends SharedElement {
  /** Data on component's containing frame, if component resides within a frame */
  containing_frame: FrameInfo
  /** Data on component's containing page, if component resides in a multi-page file */
  containing_page: any // broken link in the doc
}

export interface FullStyleMetadata extends SharedElement {
  /** The type of style */
  style_type: StyleType
  /** A user specified order number by which the style can be sorted */
  sort_position: string
}

/**
 *  A description of styles used in a file.
 */
export interface Style {
  /** The name of the stlye */
  name: string
  /** A description of the style */
  description: string
  /** The unique identifier of the style */
  key: string
  /** The type of style */
  styleType: StyleType
}

// General API Types

/** A comment or reply left by a user */
export interface Comment {
  /** Unique identifier for comment */
  id: string
  /** The file in which the comment lives */
  file_key: string
  /** If present, the id of the comment to which this is the reply */
  parent_id: string
  /** The user who left the comment */
  user: User
  /** The time at which the comment was left */
  created_at: Date
  /** If set, when the comment was resolved */
  resolved_at: Date | null
  /**
   * (MISSING IN DOCS)
   * The content of the comment
   */
  message: string
  client_meta: Position | FrameOffset
  /**
   * Only set for top level comments. The number displayed with the
   * comment in the UI
   */
  order_id: number
}

/** A description of a user */
export interface User {
  /** Unique stable id of the user */
  id: string
  /** Name of the user */
  handle: string
  /** URL link to the user's profile image */
  img_url: string
}

/** A relative offset within a frame */
export interface FrameOffset {
  /** Unique id specifying the frame */
  node_id: string
  /** 2d vector offset within the frame */
  node_offset: Position
}

export interface ProjectSummary {
  id: string
  name: string
}

export interface FileResponse {
  components: {
    [key: string]: ComponentMetadata
  }
  styles: {
    [key: string]: Style
  }
  document: Document
  lastModified: string
  name: string
  role: RoleType
  schemaVersion: number
  thumbnailUrl: string
  version: string
}

export interface FileNodesResponse {
  nodes: {
    [key: string]: null | {
      document: NodeBase
      components: {
        [key: string]: ComponentMetadata
      }
      styles: {
        [key: string]: Style
      }
      schemaVersion: number
    }
  }
  lastModified: string
  name: string
  role: RoleType
  thumbnailUrl: string
  version: string
}

export interface VersionMetadata {
  /** Unique identifier for version */
  id: string
  /** The UTC ISO 8601 time at which the version was created */
  created_at: string
  /** The label given to the version in the editor */
  label: string
  /** The description of the version as entered in the editor */
  description: string
  /** The user that created the version */
  user: User
}

export interface FileVersionsResponse {
  versions: Array<VersionMetadata>
}

export interface FileImageResponse {
  err: string | null
  images: {
    [key: string]: string
  }
}

export interface FileImageFillsResponse {
  error: boolean
  status: number
  meta: {
    images: {
      [key: string]: string
    }
  }
}

export interface CommentsResponse {
  comments: Array<Comment>
}

export interface ComponentResponse {
  error: boolean
  status: number
  meta: FullComponentMetadata
}

export interface ComponentSetResponse {
  error: boolean
  status: number
  meta: FullComponentMetadata
}

export interface StyleResponse {
  error: boolean
  status: number
  meta: FullStyleMetadata
}

export interface FileSummary {
  key: string
  name: string
  thumbnail_url: string
  last_modified: string
}

export interface TeamProjectsResponse {
  name: string
  projects: Array<ProjectSummary>
}

export interface ProjectFilesResponse {
  name: string
  files: Array<FileSummary>
}

interface PaginationMeta {
  before: number
  after: number
}

export interface TeamComponentsResponse {
  error: boolean
  status: number
  meta: {
    components: Array<FullComponentMetadata>
    cursor: PaginationMeta
  }
}

export interface FileComponentsResponse {
  error: boolean
  status: number
  meta: {
    components: Array<FullComponentMetadata>
  }
}

export interface TeamComponentSetsResponse {
  error: boolean
  status: number
  meta: {
    component_sets: Array<FullComponentMetadata>
    cursor: PaginationMeta
  }
}

export interface FileComponentSetsResponse {
  error: boolean
  status: number
  meta: {
    component_sets: Array<FullComponentMetadata>
  }
}

export interface TeamStylesResponse {
  error: boolean
  status: number
  meta: {
    styles: Array<FullStyleMetadata>
    cursor: PaginationMeta
  }
}

export interface FileStylesResponse {
  error: boolean
  status: number
  meta: {
    styles: Array<FullStyleMetadata>
  }
}
