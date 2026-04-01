import Layout from "@/components/Layout";

const Privacy = () => (
  <Layout>
    <div className="container py-16">
      <h1 className="font-serif text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2024</p>
      <div className="mt-8 max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Information We Collect</h2><p>We collect information you provide directly, such as your name, email address, payment information, and donation preferences. We also automatically collect usage data including your IP address, browser type, and interaction with our platform.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">How We Use Your Information</h2><p>Your information is used to process donations, communicate with you about your account and donations, improve our platform, and comply with legal obligations. We never sell your personal data to third parties.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Data Security</h2><p>We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal and financial information.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Your Rights</h2><p>You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time. Contact us at privacy@charityapp.com for any data-related requests.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Cookies</h2><p>We use cookies to enhance your browsing experience and analyze platform usage. You can manage cookie preferences through your browser settings.</p></section>
      </div>
    </div>
  </Layout>
);

export default Privacy;
