import * as React from 'react';

import { Html, Button, Head, Container, Img } from "@react-email/components";
interface EmailProps {
  otp: string;
}
const VerifyEmail: React.FC<Readonly<EmailProps>> = (props) => {
  const { otp } = props
 

  return (
    <Html lang="en">
      <Head>
        <title> Olivers Verify Email</title>
      </Head>
      <Container>
        <h1 style={{ color: "black" }}>Verify your email</h1>
        <p style={{ color: "black" }}>Below is the otp for verify your email.</p> - <b style={{ color: "black" }}>{otp}</b>
        <p style={{ color: "#6c757d" }}>If you did not request the email verification, please ignore this email.</p>
      </Container>
    </Html>
  );
}
export default VerifyEmail