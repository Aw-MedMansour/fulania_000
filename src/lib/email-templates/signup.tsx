import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  BrandHeader,
  BrandFooter,
  sharedStyles,
} from "./brand-shared";

interface SignupEmailProps {
  siteName: string;
  siteUrl: string;
  recipient: string;
  confirmationUrl: string;
}

export const SignupEmail = ({
  siteName = "FulanIA",
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez votre adresse email pour {siteName}</Preview>
    <Body style={sharedStyles.main}>
      <Container style={sharedStyles.container}>
        <BrandHeader siteName={siteName} />
        <Section style={sharedStyles.contentSection}>
          <Heading style={sharedStyles.h1}>Confirmez votre email</Heading>
          <Text style={sharedStyles.text}>
            Merci de rejoindre{" "}
            <Link href={siteUrl} style={sharedStyles.link}>
              <strong>{siteName}</strong>
            </Link>{" "}
            !
          </Text>
          <Text style={sharedStyles.text}>
            Veuillez confirmer votre adresse email ({" "}
            <Link href={`mailto:${recipient}`} style={sharedStyles.link}>
              {recipient}
            </Link>
            ) en cliquant sur le bouton ci-dessous :
          </Text>
          <Button style={sharedStyles.button} href={confirmationUrl}>
            Vérifier mon email
          </Button>
          <Text style={sharedStyles.text}>
            Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
          </Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
);

export default SignupEmail;
