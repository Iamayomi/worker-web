declare module "react-simple-maps" {
  import type { ReactNode } from "react";

  export type Point = [number, number];

  interface GeographyChildProps {
    geographies: {
      rsmKey: string;
      properties: Record<string, unknown>;
      [key: string]: unknown;
    }[];
  }

  export function ComposableMap(props: {
    projection?: string;
    projectionConfig?: { scale?: number; center?: Point; rotate?: number[] };
    width?: number;
    height?: number;
    viewBox?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }): React.JSX.Element;

  export function Geographies(props: {
    geography: string | object | object[];
    children: (data: GeographyChildProps) => ReactNode;
  }): React.JSX.Element;

  export function Geography(props: {
    geography: { rsmKey: string; [key: string]: unknown };
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }): React.JSX.Element;

  export function Marker(props: {
    coordinates: Point;
    children?: ReactNode;
  }): React.JSX.Element;
}
