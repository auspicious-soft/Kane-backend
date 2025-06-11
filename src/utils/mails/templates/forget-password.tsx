import * as React from "react";

import { Html, Button, Head, Container, Img } from "@react-email/components";
interface EmailProps {
  otp: string;
}
const ForgotPasswordEmail: React.FC<Readonly<EmailProps>> = (props) => {
  const { otp } = props;
  

  return (
    <Html lang="en">
      <Head>
        <title> Olivers Reset Password</title>
      </Head>
      <Container>
        <h1 style={{ color: "black" }}>Reset Password</h1>
        <p style={{ color: "black" }}>Below is the otp for resetting the password.</p> - <b style={{ color: "black" }}>{otp}</b>
        <p style={{ color: "#6c757d" }}>If you did not request the reset password, please ignore this email.</p>
      </Container>
    </Html>
  );
};
export default ForgotPasswordEmail;
