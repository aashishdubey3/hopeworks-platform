import { Link } from 'react-router-dom';

const contentMap = {
  'Our Mission': {
    intro: 'HopeWorks is a digital platform built to connect verified NGOs, social impact campaigns, and generous supporters in one transparent ecosystem.',
    sections: [
      {
        heading: 'What we do',
        body: 'We help charitable organizations publish authentic campaigns, receive donations securely, and share verifiable impact with supporters. Every donation journey is designed to be clear, traceable, and easy to understand.'
      },
      {
        heading: 'Why it matters',
        body: 'Trust is essential in philanthropy. HopeWorks combines campaign visibility, donor history, tax-compliant receipts, and transparent reporting so nonprofits and supporters can collaborate with confidence.'
      },
      {
        heading: 'Our promise',
        body: 'We are committed to ethical fundraising, responsible data handling, and building a platform where social good can scale without losing accountability.'
      }
    ]
  },
  '80G Tax Compliance': {
    intro: 'HopeWorks supports compliant giving by helping donors access documentation and helping partner NGOs maintain the records needed for transparent charitable operations.',
    sections: [
      {
        heading: 'Receipt and documentation support',
        body: 'When available, donors can download 80G-aligned receipts directly from their dashboard for their records, tax filing, and personal documentation.'
      },
      {
        heading: 'NGO readiness',
        body: 'Partner organizations are encouraged to maintain accurate donation records, campaign details, and supporting documents so each contribution can be traced responsibly.'
      },
      {
        heading: 'Not tax advice',
        body: 'The platform provides operational support and documentation tools, but donors and organizations should consult qualified tax professionals for personalized advice.'
      }
    ]
  },
  'Contact Us': {
    intro: 'Our team is available to support donors, NGOs, CSR partners, and anyone interested in learning more about HopeWorks.',
    sections: [
      {
        heading: 'Support channels',
        body: 'We assist with donation questions, campaign onboarding, NGO verification, dashboard access, and platform troubleshooting.'
      },
      {
        heading: 'Response expectations',
        body: 'We aim to respond to general inquiries promptly and provide appropriate direction for account, compliance, and operational requests.'
      },
      {
        heading: 'Get involved',
        body: 'If you are an NGO, donor, or corporate partner, we welcome a conversation about how HopeWorks can support your impact initiatives.'
      }
    ]
  },
  'Privacy Policy': {
    intro: 'We respect the privacy of our users and handle personal information with care, transparency, and appropriate security practices.',
    sections: [
      {
        heading: 'Information we collect',
        body: 'We may collect your name, email address, donation activity, campaign information, and account details when you register, donate, or interact with the platform.'
      },
      {
        heading: 'How we use it',
        body: 'This information helps us operate the platform, support account access, deliver receipts, improve user experience, and communicate relevant updates.'
      },
      {
        heading: 'Your control',
        body: 'You may update your account information and contact our team with privacy questions or requests related to your data handling preferences.'
      }
    ]
  },
  'Terms of Service': {
    intro: 'These terms govern the use of HopeWorks and outline the responsibilities of donors, NGOs, and visitors using the platform.',
    sections: [
      {
        heading: 'Acceptable use',
        body: 'The platform may be used for lawful charitable, social impact, and community engagement purposes. Activities that misrepresent causes, abuse trust, or violate applicable law are not permitted.'
      },
      {
        heading: 'Account responsibility',
        body: 'Users are responsible for keeping their account credentials secure and for providing accurate information during registration and donation flows.'
      },
      {
        heading: 'Platform changes',
        body: 'HopeWorks may update features, policies, and content to improve reliability, security, and user experience over time.'
      }
    ]
  }
};

export default function InfoPage({ title, description }) {
  const content = contentMap[title] || {
    intro: description,
    sections: [
      {
        heading: 'Platform overview',
        body: 'HopeWorks is designed to help supporters and organizations collaborate on credible, measurable social impact.'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f7fbff,_#f2f7fb)] px-6 py-16">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl md:p-10">
        <div className="mb-6 inline-flex rounded-full border border-[#007A78]/20 bg-[#E6F2F2] px-3 py-1 text-sm font-semibold text-[#007A78]">
          HopeWorks platform
        </div>
        <h1 className="font-serif text-4xl font-black text-[#0B2948]">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{content.intro}</p>

        <div className="mt-8 space-y-5">
          {content.sections.map((section) => (
            <div key={section.heading} className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-black text-[#0B2948]">{section.heading}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
            </div>
          ))}
        </div>

        <Link to="/" className="mt-8 inline-flex text-sm font-bold text-[#007A78] hover:underline">
          Return home →
        </Link>
      </div>
    </div>
  );
}
