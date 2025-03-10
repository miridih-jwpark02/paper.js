/*!
 * Paper.js v0.13.3 - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Copyright (c) 2011 - 2020, Jürg Lehni & Jonathan Puckey
 * http://juerglehni.com/ & https://puckey.studio/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 *
 * Date: 2025-03-10
 *
 * This is a simplified type definition.
 */

declare namespace paper {
  /**
   * The PaperScope class represents the scope associated with a Paper
   * context.
   */
  class PaperScope {
    /**
     * The version of Paper.js, as a string.
     */
    version: string;
    
    /**
     * The currently active project.
     */
    project: Project;
    
    /**
     * The list of all open projects within the current Paper.js context.
     */
    projects: Project[];
    
    /**
     * The reference to the active view.
     */
    view: View;
    
    /**
     * The reference to the active tool.
     */
    tool: Tool;
    
    /**
     * The list of available tools.
     */
    tools: Tool[];
  }
  
  /**
   * The Project class defines an abstract container for items.
   */
  class Project {
    /**
     * The currently active path style.
     */
    currentStyle: Style;
    
    /**
     * The currently active layer.
     */
    activeLayer: Layer;
    
    /**
     * The layers contained within the project.
     */
    layers: Layer[];
    
    /**
     * The selected items contained within the project.
     */
    selectedItems: Item[];
    
    /**
     * The view associated with the project.
     */
    view: View;
  }
  
  /**
   * The Layer class provides a way to group items.
   */
  class Layer extends Group {
    /**
     * Creates a new Layer item.
     */
    constructor(items?: Item[]);
  }
  
  /**
   * The Group class represents a group of items.
   */
  class Group extends Item {
    /**
     * Creates a new Group item.
     */
    constructor(items?: Item[]);
    
    /**
     * The children items contained within this group.
     */
    children: Item[];
  }
  
  /**
   * The base class for all items.
   */
  class Item {
    /**
     * The name of the item.
     */
    name: string;
    
    /**
     * The item's position.
     */
    position: Point;
    
    /**
     * The item's bounds.
     */
    bounds: Rectangle;
    
    /**
     * The item's style.
     */
    style: Style;
    
    /**
     * The item's visibility.
     */
    visible: boolean;
    
    /**
     * The item's opacity.
     */
    opacity: number;
  }
  
  /**
   * The Point object represents a point in the two dimensional space.
   */
  class Point {
    /**
     * Creates a Point object with the given x and y coordinates.
     */
    constructor(x: number, y: number);
    
    /**
     * The x coordinate of the point.
     */
    x: number;
    
    /**
     * The y coordinate of the point.
     */
    y: number;
  }
  
  /**
   * The Rectangle object represents a rectangle.
   */
  class Rectangle {
    /**
     * Creates a Rectangle object.
     */
    constructor(x: number, y: number, width: number, height: number);
    
    /**
     * The x coordinate of the rectangle.
     */
    x: number;
    
    /**
     * The y coordinate of the rectangle.
     */
    y: number;
    
    /**
     * The width of the rectangle.
     */
    width: number;
    
    /**
     * The height of the rectangle.
     */
    height: number;
  }
  
  /**
   * The Style class represents the style of an item.
   */
  class Style {
    /**
     * The color of the stroke.
     */
    strokeColor: Color;
    
    /**
     * The width of the stroke.
     */
    strokeWidth: number;
    
    /**
     * The color of the fill.
     */
    fillColor: Color;
  }
  
  /**
   * The Color object represents a color.
   */
  class Color {
    /**
     * Creates a Color object.
     */
    constructor(red?: number, green?: number, blue?: number, alpha?: number);
  }
  
  /**
   * The View object represents a view.
   */
  class View {
    /**
     * The center point of the view.
     */
    center: Point;
    
    /**
     * The size of the view.
     */
    size: Size;
  }
  
  /**
   * The Size object represents a size.
   */
  class Size {
    /**
     * Creates a Size object with the given width and height.
     */
    constructor(width: number, height: number);
    
    /**
     * The width of the size.
     */
    width: number;
    
    /**
     * The height of the size.
     */
    height: number;
  }
  
  /**
   * The Tool object represents a tool.
   */
  class Tool {
    /**
     * The function to be called when the mouse button is pressed.
     */
    onMouseDown: (event: ToolEvent) => void;
    
    /**
     * The function to be called when the mouse position changes.
     */
    onMouseMove: (event: ToolEvent) => void;
    
    /**
     * The function to be called when the mouse button is released.
     */
    onMouseUp: (event: ToolEvent) => void;
  }
  
  /**
   * The ToolEvent object is passed to the tool's mouse event handlers.
   */
  class ToolEvent {
    /**
     * The position of the mouse in project coordinates.
     */
    point: Point;
    
    /**
     * The position of the mouse in project coordinates when the mouse button was last pressed.
     */
    downPoint: Point;
    
    /**
     * The position of the mouse in project coordinates when the mouse button was last released.
     */
    lastPoint: Point;
  }
}

declare module 'paper/dist/paper-core' {
  const paperCore: paper.PaperScope;
  export = paperCore;
}

declare module 'paper' {
  const paperFull: paper.PaperScope;
  export = paperFull;
}
