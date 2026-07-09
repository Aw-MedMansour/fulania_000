import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  BrandHeader,
  BrandFooter,
  sharedStyles,
} from "./brand-shared";

interface RecoveryEmailProps {
  siteName: string;
  confirmationUrl: string;
}

export const RecoveryEmail = ({
  siteName = "FulanIA",
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Réinitialisez votre mot de passe pour {siteName}</Preview>
    <Body style={sharedStyles.main}>
      <Container style={sharedStyles.container}>
        <BrandHeader siteName={siteName} />
        <Section style={sharedStyles.contentSection}>
          <Heading style={sharedStyles.h1}>Réinitialisez votre mot de passe</Heading>
          <Text style={sharedStyles.text}>
            Nous avons reçu une demande de réinitialisation de mot de passe pour {siteName}. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </Text>
          <Button style={sharedStyles.button} href={confirmationUrl}>
            Réinitialiser le mot de passe
          </Button>
          <Text style={sharedStyles.text}>
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe ne sera pas modifié.
          </Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
);

export default RecoveryEmail;
