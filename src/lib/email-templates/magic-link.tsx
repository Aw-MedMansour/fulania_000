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

interface MagicLinkEmailProps {
  siteName: string;
  confirmationUrl: string;
}

export const MagicLinkEmail = ({
  siteName = "FulanIA",
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre lien de connexion pour {siteName}</Preview>
    <Body style={sharedStyles.main}>
      <Container style={sharedStyles.container}>
        <BrandHeader siteName={siteName} />
        <Section style={sharedStyles.contentSection}>
          <Heading style={sharedStyles.h1}>Votre lien de connexion</Heading>
          <Text style={sharedStyles.text}>
            Cliquez sur le bouton ci-dessous pour vous connecter à {siteName}. Ce lien expirera sous peu.
          </Text>
          <Button style={sharedStyles.button} href={confirmationUrl}>
            Se connecter
          </Button>
          <Text style={sharedStyles.text}>
            Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.
          </Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
);

export default MagicLinkEmail;
