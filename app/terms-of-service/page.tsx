import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for deen.page — the curated directory of Muslim Builders & Islamic Projects.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-display font-semibold mb-2 gradient-text-gold">
        Terms of Service
      </h1>
      <p className="text-base-content/60 text-sm mb-12">
        Last updated: March 14, 2026
      </p>

      <div className="prose prose-sm max-w-none text-base-content/80 space-y-10">
        {/* ── 1. Acceptance ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using <strong>deen.page</strong> (&quot;the
            Platform&quot;), operated by Wahab Shaikh (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these
            Terms of Service. If you do not agree, please do not use the
            Platform.
          </p>
        </section>

        {/* ── 2. Description of Service ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            2. Description of Service
          </h2>
          <p>
            deen.page is a curated directory of Muslim Builders &amp; Islamic
            Projects. The Platform indexes Muslim developers, founders, and
            indie hackers building tools for the Ummah and provides them with
            public profiles and project showcases. Primary exploration happens
            through projects, with builder profiles acting as the identity
            layer.
          </p>
        </section>

        {/* ── 3. Accounts & Authentication ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            3. Accounts &amp; Authentication
          </h2>
          <p>
            Access to certain features requires signing in via{" "}
            <strong>X (Twitter) OAuth</strong>. By signing in, you authorize us
            to access your basic X profile information (username and public
            profile data).
          </p>
          <p className="mt-2">Builders on the Platform exist in two states:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Indexed</strong> — added by the platform; appears in the
              directory with a public profile but cannot edit it.
            </li>
            <li>
              <strong>Verified</strong> — authenticated via X OAuth and verified
              ownership of their profile; can edit their profile, add/edit/delete
              projects, and manage their public builder presence.
            </li>
          </ul>
          <p className="mt-2">
            You are responsible for maintaining the security of your X account,
            which governs access to your deen.page profile.
          </p>
        </section>

        {/* ── 4. Builder Activation ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            4. Builder Activation
          </h2>
          <p>
            To activate a verified builder profile, you must sign in with your
            own X account and complete the shahadah onboarding flow presented by
            the Platform.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>You may only complete the flow for a profile you own.</li>
            <li>
              We may create a new verified profile or claim an indexed profile
              that matches your authenticated X handle.
            </li>
            <li>
              We may refuse, suspend, or remove access if the onboarding flow is
              abused or used to impersonate another builder.
            </li>
          </ul>
        </section>

        {/* ── 5. User Content ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            5. User Content
          </h2>
          <p>
            &quot;User Content&quot; refers to builder profile information and
            project listings you create or edit on the Platform. By submitting
            User Content, you:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Retain ownership of your content.
            </li>
            <li>
              Grant us a worldwide, non-exclusive, royalty-free license to
              display, reproduce, and distribute your content on the Platform,
              including in search results and Open Graph images generated for
              social sharing.
            </li>
            <li>
              Represent that you have the right to submit such content and that
              it does not infringe on any third-party rights.
            </li>
          </ul>
        </section>

        {/* ── 6. Public Nature ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            6. Public Nature of the Directory
          </h2>
          <p>
            deen.page is a public directory. All builder profiles and project
            listings are publicly visible by design, including to search
            engines. By using the Platform, you acknowledge and consent to the
            public display of your profile and project information.
          </p>
        </section>

        {/* ── 7. Acceptable Use ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            7. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Submit false, misleading, or inaccurate information in your
              profile or project listings.
            </li>
            <li>
              Impersonate another person or claim ownership of a profile that is
              not yours.
            </li>
            <li>
              Use the Platform to distribute spam, malware, or harmful content.
            </li>
            <li>
              Attempt to scrape, harvest, or bulk-download data from the
              Platform in an automated fashion without permission.
            </li>
            <li>
              Engage in any activity that disrupts or interferes with the
              Platform&apos;s operation.
            </li>
            <li>
              Use the Platform for any purpose that is unlawful or prohibited by
              these Terms.
            </li>
          </ul>
        </section>

        {/* ── 8. Third-Party Links ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            8. Third-Party Links &amp; Services
          </h2>
          <p>
            The Platform contains links to third-party websites, including
            project URLs, GitHub repositories, app store listings, and support
            links. We are not responsible for the content, privacy practices, or
            availability of any third-party websites. Accessing third-party
            links is at your own risk.
          </p>
        </section>

        {/* ── 9. Intellectual Property ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            9. Intellectual Property
          </h2>
          <p>
            The deen.page name, logo, design, and original content (excluding
            User Content) are the property of Wahab Shaikh. You may not use our
            branding without prior written consent.
          </p>
          <p className="mt-2">
            Project favicons, titles, and descriptions displayed on the Platform
            remain the intellectual property of their respective owners.
          </p>
        </section>

        {/* ── 10. Disclaimer ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            10. Disclaimer of Warranties
          </h2>
          <p>
            The Platform is provided on an <strong>&quot;as is&quot;</strong> and{" "}
            <strong>&quot;as available&quot;</strong> basis without warranties of
            any kind, either express or implied, including but not limited to
            implied warranties of merchantability, fitness for a particular
            purpose, and non-infringement.
          </p>
          <p className="mt-2">
            We do not warrant that the Platform will be uninterrupted,
            error-free, or secure, or that the information provided through the
            Platform is accurate or complete.
          </p>
        </section>

        {/* ── 11. Limitation of Liability ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            11. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, we shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or data, arising out of or
            related to your use of the Platform.
          </p>
        </section>

        {/* ── 12. Termination ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            12. Termination
          </h2>
          <p>
            We reserve the right to remove any builder profile, project listing,
            or account from the Platform at our sole discretion, with or without
            notice, for conduct that we determine violates these Terms or is
            harmful to other users or the Platform.
          </p>
          <p className="mt-2">
            You may request deletion of your account and associated data at any
            time by contacting us.
          </p>
        </section>

        {/* ── 13. Changes ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            13. Changes to These Terms
          </h2>
          <p>
            We may update these Terms of Service from time to time. Changes will
            be posted on this page with an updated &quot;Last updated&quot;
            date. Your continued use of the Platform after changes are posted
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* ── 14. Governing Law ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            14. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            applicable law, without regard to conflict of law principles.
          </p>
        </section>

        {/* ── 15. Contact ── */}
        <section>
          <h2 className="text-lg font-semibold text-base-content mb-3">
            15. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us via email at{" "}
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
