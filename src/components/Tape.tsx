import React, {
  CSSProperties,
  FocusEventHandler,
  ReactNode,
  useState,
  FocusEvent,
  useEffect,
  RefObject,
  useRef,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import classNames from "classnames";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import toHex from "colornames";

interface TapeProps {
  children?: ReactNode;
  style?: CSSProperties;
  isStart: boolean;
  isEnd: boolean;
  label: string;
  onUpdateContent?: (value: string) => void;
  color?: string;
  left?: string;
  top?: string;
  editable?: boolean;
}

function Tape({
  children,
  style,
  isStart,
  isEnd,
  label,
  onUpdateContent,
  color = "#0000ff",
  left,
  top,
  editable,
}: TapeProps) {
  const editRef: RefObject<HTMLElement> =
    useRef<HTMLElement>() as RefObject<HTMLElement>;
  const waves = (
    <pattern
      id="waves"
      patternUnits="userSpaceOnUse"
      width="40"
      height="80"
      patternTransform="scale(2) rotate(0)"
    >
      <rect x="0" y="0" width="100%" height="100%" fill="hsla(0,0%,100%,1)" />
      <path
        d="M-4.798 13.573C-3.149 12.533-1.446 11.306 0 10c2.812-2.758 6.18-4.974 10-5 4.183.336 7.193 2.456 10 5 2.86 2.687 6.216 4.952 10 5 4.185-.315 7.35-2.48 10-5 1.452-1.386 3.107-3.085 4.793-4.176"
        strokeWidth="1"
        stroke="hsla(258.5,59.4%,59.4%,1)"
        fill="none"
      />
      <path
        d="M-4.798 33.573C-3.149 32.533-1.446 31.306 0 30c2.812-2.758 6.18-4.974 10-5 4.183.336 7.193 2.456 10 5 2.86 2.687 6.216 4.952 10 5 4.185-.315 7.35-2.48 10-5 1.452-1.386 3.107-3.085 4.793-4.176"
        strokeWidth="1"
        stroke="hsla(339.6,82.2%,51.6%,1)"
        fill="none"
      />
      <path
        d="M-4.798 53.573C-3.149 52.533-1.446 51.306 0 50c2.812-2.758 6.18-4.974 10-5 4.183.336 7.193 2.456 10 5 2.86 2.687 6.216 4.952 10 5 4.185-.315 7.35-2.48 10-5 1.452-1.386 3.107-3.085 4.793-4.176"
        strokeWidth="1"
        stroke="hsla(198.7,97.6%,48.4%,1)"
        fill="none"
      />
      <path
        d="M-4.798 73.573C-3.149 72.533-1.446 71.306 0 70c2.812-2.758 6.18-4.974 10-5 4.183.336 7.193 2.456 10 5 2.86 2.687 6.216 4.952 10 5 4.185-.315 7.35-2.48 10-5 1.452-1.386 3.107-3.085 4.793-4.176"
        strokeWidth="1"
        stroke="hsla(47,80.9%,61%,1)"
        fill="none"
      />
    </pattern>
  );
  const svg = isStart ? (
    <svg
      className="h-[1em] z-[1] leading-[2em] font-semibold text-[1em] bg-cover bg-no-repeat bg-[color:var(--color)] hover:blur-sm hover:brightness-50 hover:sepia hover:contrast-100 hover:hue-rotate-30 hover:invert-0 hover:opacity-5 hover:saturate-150 hover:text-orange-400 hover:text-xl disabled:w-3/12 disabled:text-[color:var(--some-color)] disabled:text-[1em] md:inset-x-1/4 md:inset-y-auto supports-[display:grid]:grid supports-[display:grid]:col-span-1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 562 355"
    >
      <defs>
        {waves}
        <style></style>
      </defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_3" data-name="Layer 3">
          <polygon
            fill="url(#waves)"
            className="cls-1"
            points="561.99 0 66.24 0 10.67 30.64 100.24 66.36 0.01 95.58 206.44 149.8 33.44 186.53 67.23 218.28 0 266.92 100.99 307.96 0 355 562 354.5 561.99 0"
          />
        </g>
      </g>
    </svg>
  ) : isEnd ? (
    <svg
      className="h-[1em] z-[1] leading-[2em] font-semibold text-[1em] bg-cover bg-no-repeat bg-[color:var(--color)] hover:blur-sm hover:brightness-50 hover:sepia hover:contrast-100 hover:hue-rotate-30 hover:invert-0 hover:opacity-5 hover:saturate-150 hover:text-orange-400 hover:text-xl disabled:w-3/12 disabled:text-[color:var(--some-color)] disabled:text-[1em] md:inset-x-1/4 md:inset-y-auto supports-[display:grid]:grid supports-[display:grid]:col-span-1;"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 563.46 357.62"
    >
      <defs>{waves}</defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_3" data-name="Layer 3">
          <polygon
            fill="url(#waves)"
            className="cls-1"
            points="0.5 0.5 509.25 0.5 488.05 26.27 535.18 54.91 389.22 108.42 542.22 163.26 500.41 192.84 546.43 214.95 468 275.34 562.49 290.31 525.56 333 549.67 357.12 0.5 357.12 0.5 0.5"
          />
        </g>
      </g>
    </svg>
  ) : (
    <svg
      className="h-[1em] z-[1] leading-[2em] font-semibold text-[1em] bg-cover bg-no-repeat bg-[color:var(--color)] hover:blur-sm hover:brightness-50 hover:sepia hover:contrast-100 hover:hue-rotate-30 hover:invert-0 hover:opacity-5 hover:saturate-150 hover:text-orange-400 hover:text-xl disabled:w-3/12 disabled:text-[color:var(--some-color)] disabled:text-[1em] md:inset-x-1/4 md:inset-y-auto supports-[display:grid]:grid supports-[display:grid]:col-span-1;"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 563 359"
    >
      <defs>{waves}</defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_3" data-name="Layer 3">
          <polygon
            fill="url(#waves)"
            className="cls-1"
            points="0.5 0.5 562.5 0.5 562.5 358.5 0.64 355.5 0.5 0.5"
          />
        </g>
      </g>
    </svg>
  );
  var encodedData = renderToStaticMarkup(svg);
  var encodedSVG = "data:image/svg+xml;utf8," + encodeURIComponent(encodedData);

  const onChange = (e: ContentEditableEvent) => {
    if (e.target.value !== label) {
      onUpdateContent && onUpdateContent(e.target.value);
    }
  };

  const colorHex = toHex(color) || color;

  return (
    <div
      className={classNames(
        `h-[1em] z-[1] leading-[2em] font-semibold text-[1em] bg-cover bg-no-repeat`,
        isStart &&
          `ml-[1em] before:w-0 before:h-0 before:border-r-[var(--color)] before:content-[''] before:absolute before:-translate-y-1/2 before:border-r-[2em] before:border-y-[1em] before:border-y-transparent before:border-solid before:left-0 before:top-2/4`,
        isEnd &&
          `w-[calc(100%_-_1em)] mr-[1em] after:w-0 after:h-0 after:border-l-[var(--color)] after:content-[''] after:absolute after:-translate-y-2/4 after:border-l-[2em] after:border-y-[1em] after:border-y-transparent after:border-solid after:right-0 after:top-2/4`,
        "flex content-center justify-center pointer-events-auto  touch-manipulation",
        isStart && isEnd && "ml-[1em] mr-[1em] w-[calc(100%_-_2em)]",
        !isStart && !isEnd && "w-full"
      )}
      style={
        {
          touchAction: "none",
          color: colorHex,
          backgroundColor: colorHex,
          "--color": colorHex,
          top: top,
          left: left,
          ...style,
        } as CSSProperties
      }
    >
      {children}
      {label && (
        <ContentEditable
          innerRef={editRef}
          tagName="div"
          className="bg-transparent text-[1.5em] whitespace-nowrap overflow-visible absolute bottom-[-1.5em] bg-[white] leading-[1.5em] left-[10%] outline-none"
          html={isStart && label ? label : ""} // innerHTML of the editable div
          disabled={!editable} // use true to disable edition
          onChange={onChange} // handle innerHTML change
        />
      )}
    </div>
  );
}

export default Tape;
