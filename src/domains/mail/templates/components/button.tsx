import { Button as ReactEmailButton } from "@react-email/components";

import { buttonStyle } from "../styles/button";

type EmailButtonProps = {
  href: string;
  children: string;
};

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <ReactEmailButton href={href} style={buttonStyle}>
      {children}
    </ReactEmailButton>
  );
}
