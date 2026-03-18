import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for deen.page — how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-display font-semibold mb-2 gradient-text-gold">
        Privacy Policy
      </h1>
      <p className="text-base-content/60 text-sm mb-12">
        Last updated: March 18, 2026
      </p>

      <div className="prose prose-sm max-w-none text-base-content/80 space-y-10">
        {/* ── 1. Introduction ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            1. Introduction
          </h2>
          <p>
            Welcome to <strong>deen.page</strong> (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;). deen.page is a curated
            directory of Muslim Builders &amp; Islamic Projects, operated by
            Wahab Shaikh. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website
            at{" "}
            <Link
              href="https://deen.page"
              className="text-primary hover:underline"
            >
              deen.page
            </Link>
            .
          </p>
          <p>
            By using our platform, you agree to the collection and use of
            information in accordance with this policy. If you do not agree,
            please do not use the platform.
          </p>
        </section>

        {/* ── 2. Information We Collect ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            2. Information We Collect
          </h2>

          <h3 className="text-base font-medium text-base-content mt-4 mb-2">
            2.1 Information You Provide
          </h3>
          <p>
            When you sign in, complete the shahadah onboarding flow, or add
            content, we may collect the following information:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Builder profile data</strong>: name, X (Twitter) handle,
              avatar, country, GitHub URL, personal website URL, support link,
              and status tags (e.g., &quot;Looking for Co-founder,&quot;
              &quot;Open Source Contributor&quot;).
            </li>
            <li>
              <strong>Project data</strong>: title, description, URL, favicon,
              categories, GitHub repository URL, and app store links (App Store,
              Play Store, Chrome Web Store).
            </li>
            <li>
              <strong>Verification data</strong>: your shahadah onboarding
              submission, account linkage, and verified builder status.
            </li>
          </ul>

          <h3 className="text-base font-medium text-base-content mt-4 mb-2">
            2.2 Information Collected via Authentication
          </h3>
          <p>
            We use <strong>X (Twitter) OAuth</strong> (via Better Auth) to
            authenticate users. When you sign in, we receive your X username and
            basic profile information from X. We do not store your X password.
          </p>

          <h3 className="text-base font-medium text-base-content mt-4 mb-2">
            2.3 Information Collected Automatically
          </h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Session data</strong>: we use session cookies to keep you
              signed in. We do not use cookie caching for session data.
            </li>
            <li>
              <strong>Analytics data</strong>: we use{" "}
              <Link
                href="https://datafa.st"
                target="_blank"
                rel="noopener"
                className="text-primary hover:underline"
              >
                Datafast
              </Link>{" "}
              for privacy-friendly, anonymized website analytics. Datafast does
              not use cookies and does not collect personal data.
            </li>
            <li>
              <strong>Mashallah reactions</strong>: when you are signed in and
              use the Mashallah button on a project, we store your account
              identifier linked to that project so we can record your reaction,
              let you add or remove it (toggle), prevent duplicate reactions, and
              show aggregate counts. We may also store a small flag in your
              browser&apos;s local storage to cache your reacted state for
              display; the authoritative record is on our servers.
            </li>
          </ul>
        </section>

        {/* ── 3. How We Use Your Information ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            3. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Display your builder profile and projects in the public directory.
            </li>
            <li>
              Enable Mashallah reactions on public project pages (when signed
              in), let you add or remove your reaction, and show aggregate
              counts.
            </li>
            <li>
              Generate Open Graph images for sharing on X (Twitter) and other
              platforms.
            </li>
            <li>Enable search and discovery of builders and projects.</li>
            <li>
              Verify builder profile ownership through X (Twitter) OAuth.
            </li>
            <li>
              Activate verified builder profiles after the shahadah onboarding
              flow is completed.
            </li>
            <li>Maintain and improve the platform.</li>
          </ul>
        </section>

        {/* ── 4. Public Visibility ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            4. Public Visibility of Data
          </h2>
          <p>
            deen.page is a <strong>public directory</strong>. By its nature, the
            following data is publicly visible to anyone who visits the site:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Builder profiles (name, X handle, avatar, country, status tags,
              support link, GitHub URL, and website URL).
            </li>
            <li>
              Project listings (title, description, URL, favicon, categories,
              and store/repository links).
            </li>
            <li>
              Aggregate Mashallah reaction counts on public project listings.
            </li>
            <li>
              Builder verification status (indexed or verified).
            </li>
          </ul>
          <p className="mt-2">
            Please only provide information you are comfortable making public.
          </p>
        </section>

        {/* ── 5. Data Storage & Security ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            5. Data Storage &amp; Security
          </h2>
          <p>
            Your data is stored in a <strong>MongoDB</strong> database. The
            platform is hosted on <strong>Vercel</strong>. We implement
            reasonable technical and organizational measures to protect your
            data, but no method of transmission or storage is 100% secure. We
            cannot guarantee absolute security.
          </p>
        </section>

        {/* ── 6. Third-Party Services ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            6. Third-Party Services
          </h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>X (Twitter) OAuth</strong> — for authentication and
              profile verification.
            </li>
            <li>
              <strong>Vercel</strong> — for hosting and serverless functions.
            </li>
            <li>
              <strong>MongoDB</strong> — for data storage.
            </li>
            <li>
              <strong>Datafast</strong> — for privacy-friendly website analytics.
            </li>
          </ul>
          <p className="mt-2">
            Each third-party service has its own privacy policy governing the
            data they process. We encourage you to review their respective
            policies.
          </p>
        </section>

        {/* ── 7. Cookies ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            7. Cookies
          </h2>
          <p>
            We use <strong>essential session cookies</strong> to keep you signed
            in after authentication. These cookies are strictly necessary for the
            functioning of the platform and cannot be opted out of while using
            authenticated features.
          </p>
          <p>
            We do not use advertising or tracking cookies. Our analytics provider
            (Datafast) is cookieless.
          </p>
          <p>
            For Mashallah reactions, we may store a small flag in your
            browser&apos;s local storage to cache whether you have reacted to a
            project, so we can show the correct state before re-checking with our
            servers. The actual record of your reaction is stored on our servers
            and linked to your account. This is not used for advertising or
            cross-site tracking.
          </p>
        </section>

        {/* ── 8. Your Rights ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            8. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Access</strong> the personal data we hold about you.
            </li>
            <li>
              <strong>Edit</strong> your builder profile and project information
              (available to verified builders through the platform).
            </li>
            <li>
              <strong>Remove a Mashallah reaction</strong> at any time by
              clicking the Mashallah button again on that project (when signed
              in).
            </li>
            <li>
              <strong>Request deletion</strong> of your account and associated
              data by contacting us.
            </li>
            <li>
              <strong>Withdraw consent</strong> for data processing at any time
              by contacting us.
            </li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, please reach out to us via email at{" "}
            <Link
              href="mailto:contact@deen.page"
              className="text-primary hover:underline"
            >
              contact@deen.page
            </Link>
            .
          </p>
        </section>

        {/* ── 9. Children's Privacy ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            9. Children&apos;s Privacy
          </h2>
          <p>
            deen.page is not directed at children under the age of 13. We do not
            knowingly collect personal data from children. If you believe a child
            has provided us with personal data, please contact us and we will
            delete it promptly.
          </p>
        </section>

        {/* ── 10. Changes to This Policy ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated &quot;Last updated&quot; date. We
            encourage you to review this policy periodically.
          </p>
        </section>

        {/* ── 11. Contact ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            11. Contact Us
          </h2>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us via email at{" "}
            <Link
              href="mailto:contact@deen.page"
              className="text-primary hover:underline"
            >
              contact@deen.page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
