import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Building2, Users } from 'lucide-react';
import { useDemoData } from '../data/context';

export function LoginPage(){
  const router = useRouter();
  const [email, setEmail] = useState('alex.morgan@northstar.co');
  const [notice, setNotice] = useState('');

  const enter = () => {
    localStorage.setItem('operations-flow-demo-session', 'true');
    setNotice('Demo access is ready. No authentication service is connected.');
    window.setTimeout(() => router.push('/dashboard'), 550);
  };

  return (
    <div className="login-page">
      <section className="login-brand-side">
        <Link className="login-wordmark" href="/login">
          <span className="brand-mark">O</span>Operations Flow
        </Link>
        <div className="login-quote">
          <h1>Make the whole organization easier to understand.</h1>
          <p>People, operations, decisions and governance — brought into one considered workspace.</p>
        </div>
        <div className="login-side-note">A calm operating workspace for the work behind the work.</div>
      </section>
      <section className="login-form-side">
        <div className="login-form">
          <div className="eyebrow">NORTHSTAR COLLECTIVE · DEMO WORKSPACE</div>
          <h2>Welcome back</h2>
          <p>Sign in to your organization workspace. This preview uses browser-only demo access.</p>
          <div className="form-field">
            <label htmlFor="login-email">Work email</label>
            <input id="login-email" className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} data-testid="input-login-email"/>
          </div>
          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" className="field" type="password" placeholder="Password is not required for the demo" data-testid="input-login-password"/>
          </div>
          <button className="btn btn-primary" onClick={enter} data-testid="button-demo-login">
            Continue to demo workspace <ArrowRight size={14}/>
          </button>
          {notice && <div className="notice accent" style={{marginTop:12}} data-testid="text-login-status">{notice}</div>}
        </div>
        <div className="notice" style={{marginTop:17}}>
          <strong>Demo access</strong><br/>
          Continue opens the seeded Northstar workspace. Changes are saved in this browser only; no account or backend authentication is used.
        </div>
        <div className="login-footer">
          Need to configure a workspace? <Link href="/onboarding" style={{color:'#536e62',fontWeight:700}}>Start organization setup</Link><br/><br/>
          Sign-in integration-ready entry · Identity services are not connected.
        </div>
      </section>
    </div>
  );
}

export function OnboardingPage(){
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const { data } = useDemoData();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState(data.organization.name);
  const [industry, setIndustry] = useState(data.organization.industry);
  const [site, setSite] = useState('Chicago Office');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setOrgName(data.organization.name);
    setIndustry(data.organization.industry);
  }, [data.organization.name, data.organization.industry]);

  const next = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      localStorage.setItem('operations-flow-onboarding-local', JSON.stringify({orgName, industry, site, completedAt: new Date().toISOString()}));
      setSaved(true);
    }
  };

  return (
    <div className="onboarding-page">
      <section className="login-brand-side">
        <Link className="login-wordmark" href="/login">
          <span className="brand-mark">O</span>Operations Flow
        </Link>
        <div className="login-quote">
          <h1>A little structure for the work ahead.</h1>
          <p>Set up an organization workspace that reflects how your people actually work together.</p>
        </div>
        <div className="login-side-note">Setup is a local preview. Nothing is sent to a server.</div>
      </section>
      <section className="login-form-side">
        <div className="panel onboarding-card">
          <div className="eyebrow">ORGANIZATION SETUP · STEP {step + 1} OF 3</div>
          <h2 className="page-title" style={{fontSize:24}}>
            {['Tell us about your organization', 'Add your first site', 'Ready to look around?'][step]}
          </h2>
          <p className="page-subtitle">
            {['Start with a few basics. You can refine these later.', 'Sites help keep people and operations in context.', 'Your demo workspace will be ready in this browser.'][step]}
          </p>
          <div className="step-track">
            {[0, 1, 2].map(i => <span className={`step-segment ${i <= step ? 'on' : ''}`} key={i}/>)}
          </div>
          {step === 0 ? (
            <div className="form-grid">
              <div className="form-field full">
                <label htmlFor="org-name">Organization name</label>
                <input id="org-name" className="field" value={orgName} onChange={e => setOrgName(e.target.value)} data-testid="input-onboarding-org"/>
              </div>
              <div className="form-field full">
                <label htmlFor="org-industry">Industry or operating context</label>
                <input id="org-industry" className="field" value={industry} onChange={e => setIndustry(e.target.value)} data-testid="input-onboarding-industry"/>
              </div>
            </div>
          ) : step === 1 ? (
            <div className="form-grid">
              <div className="form-field full">
                <label htmlFor="org-site">First site or working location</label>
                <input id="org-site" className="field" value={site} onChange={e => setSite(e.target.value)} data-testid="input-onboarding-site"/>
              </div>
              <div className="notice accent form-field full">
                <Building2 size={15}/> Sites are organizational context for records, not a facility template.
              </div>
            </div>
          ) : (
            <div style={{textAlign:'center',padding:'30px 0'}}>
              <div style={{fontSize:48,marginBottom:12}}><Check size={48} style={{color:'#526c60'}}/></div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>Workspace ready</div>
              <div style={{fontSize:11,color:'#85837a',marginBottom:20}}>{orgName} · {industry} · {site}</div>
              <button className="btn btn-primary" onClick={() => setLocation('/dashboard')} data-testid="button-complete-onboarding">
                Go to dashboard <ArrowRight size={14}/>
              </button>
            </div>
          )}
          {step < 2 && (
            <div style={{display:'flex',gap:9,marginTop:22}}>
              <button className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</button>
              <button className="btn btn-primary" onClick={next} data-testid="button-onboarding-next">
                {step === 1 ? 'Complete setup' : 'Next'} <ArrowRight size={14}/>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
