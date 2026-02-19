declare module "react-window" {
  import * as React from "react";

  export type Align = "auto" | "smart" | "center" | "end" | "start";
  export type ScrollDirection = "forward" | "backward";

  export interface ListOnItemsRenderedProps {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  }

  export interface ListOnScrollProps {
    scrollDirection: ScrollDirection;
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
  }

  export interface ListChildComponentProps<T = unknown> {
    index: number;
    style: React.CSSProperties;
    data: T;
    isScrolling?: boolean;
  }

  interface CommonListProps<T = unknown> {
    children: React.ComponentType<ListChildComponentProps<T>>;
    className?: string;
    direction?: "ltr" | "rtl";
    height: number;
    initialScrollOffset?: number;
    innerElementType?: React.ComponentType | string;
    innerRef?: React.Ref<unknown>;
    itemCount: number;
    itemData?: T;
    itemKey?: (index: number, data: T) => React.Key;
    layout?: "horizontal" | "vertical";
    onItemsRendered?: (props: ListOnItemsRenderedProps) => void;
    onScroll?: (props: ListOnScrollProps) => void;
    outerElementType?: React.ComponentType | string;
    outerRef?: React.Ref<unknown>;
    overscanCount?: number;
    style?: React.CSSProperties;
    useIsScrolling?: boolean;
    width: number | string;
  }

  export interface FixedSizeListProps<T = unknown> extends CommonListProps<T> {
    itemSize: number;
  }

  export interface VariableSizeListProps<T = unknown> extends CommonListProps<T> {
    estimatedItemSize?: number;
    itemSize: (index: number) => number;
  }

  export class FixedSizeList<T = unknown> extends React.PureComponent<FixedSizeListProps<T>> {
    scrollTo(scrollOffset: number): void;
    scrollToItem(index: number, align?: Align): void;
  }

  export class VariableSizeList<T = unknown> extends React.PureComponent<VariableSizeListProps<T>> {
    resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
    scrollTo(scrollOffset: number): void;
    scrollToItem(index: number, align?: Align): void;
  }
}
