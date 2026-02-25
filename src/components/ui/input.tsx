import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Input 基础输入框组件
 *
 * 用途：
 * - 提供项目统一的输入框样式与交互态。
 * - 支持外部通过 ref 获取原生 HTMLInputElement，以便实现自动聚焦等行为。
 *
 * 参数：
 * - className: 额外的 Tailwind class
 * - type: input 类型
 * - props: 其余原生 input 属性（placeholder/value/onChange 等）
 *
 * 返回值：
 * - 渲染一个带统一样式的 <input />
 *
 * 异常：
 * - 无
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
