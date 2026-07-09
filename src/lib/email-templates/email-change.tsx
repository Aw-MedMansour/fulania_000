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

interface EmailChangeEmailProps {
  siteName: string;
  oldEmail: string;
  email: string;
  newEmail: string;
  confirmationUrl: string;
}

export const EmailChangeEmail = ({
  siteName = "FulanIA",
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez le changement d'email pour {siteName}</Preview>
    <Body style={sharedStyles.main}>
      <Container style={sharedStyles.container}>
        <BrandHeader siteName={siteName} />
        <Section style={sharedStyles.contentSection}>
          <Heading style={sharedStyles.h1}>Confirmez le changement d'email</Heading>
          <Text style={sharedStyles.text}>
            Vous avez demandé à changer l'adresse email associée à {siteName} de{" "}
            <Link href={`mailto:${oldEmail}`} style={sharedStyles.link}>
              {oldEmail}
            </Link>{" "}
            vers{" "}
            <Link href={`mailto:${newEmail}`} style={sharedStyles.link}>
              {newEmail}
            </Link>
            .
          </Text>
          <Text style={sharedStyles.text}>
            Cliquez sur le bouton ci-dessous pour confirmer ce changement :
          </Text>
          <Button style={sharedStyles.button} href={confirmationUrl}>
            Confirmer le changement
          </Button>
          <Text style={sharedStyles.text}>
            Si vous n'avez pas demandé ce changement, veuillez sécuriser votre compte immédiatement.
          </Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
);

export default EmailChangeEmail;
