import { useState } from 'react';
import { ArrowRight, MessageSquareText, Sparkles } from 'lucide-react';
import { useDemoData } from '../data/context';
import ResourcePage from '../components/ResourcePage';

const prompts = ['What decisions are waiting?', 'Which operational risks should I review?', 'What has changed recently?'];

export function IntelligencePage(){
  const { data } = useDemoData();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{text: string; refs: string[]} | null>(null);

  const ask = (value = question) => {
    const q = value.trim();
    if (!q) return;
    const lower = q.toLowerCase();
    let refs: string[] = [];
    let text = '';

    if (lower.includes('decision') || lower.includes('approval')) {
      const open = data.approvals.filter(a => a.status === 'Pending');
      refs = open.slice(0, 3).map(a => a.id);
      text = `There are ${open.length} sample approvals awaiting a decision. The oldest visible request is "${open.sort((a, b) => a.submitted.localeCompare(b.submitted))[0]?.name}," submitted ${open.sort((a, b) => a.submitted.localeCompare(b.submitted))[0]?.submitted}. This is a summary of seeded demo records, not a live recommendation.`;
    } else if (lower.includes('risk') || lower.includes('operational')) {
      refs = ['task-04', 'inv-01', 'inv-04'];
      text = 'The seeded workspace highlights a research agreement task marked at risk and two inventory records below their reorder point. Confirm ownership and timing in the source records before acting.';
    } else {
      refs = data.activity.slice(0, 3).map(a => a.id);
      text = 'Recent sample activity includes an approval decision, an updated vendor due diligence document, and a research agreement task marked at risk. This answer is limited to the local sample workspace.';
    }
    setAnswer({text, refs});
  };

  const allRecords: {id: string; name: string}[] = [...data.approvals, ...data.tasks, ...data.inventory, ...data.activity];
  const recordName = (id: string) => allRecords.find(r => r.id === id)?.name ?? id;

  return (
    <main className="page-wrap">
      <div className="page-heading">
        <div>
          <div className="eyebrow">INTELLIGENCE · SAMPLE DATA</div>
          <h1 className="page-title">Organizational intelligence</h1>
          <div className="page-subtitle">Explore patterns in the records already in your Operations Flow workspace.</div>
        </div>
        <span className="pill info">Demo data only</span>
      </div>
      <div className="notice" style={{marginBottom: 17}}>
        This experience is not connected to live AI. Answers below are deterministic summaries of seeded local records, with source references shown for review.
      </div>
      <div className="dashboard-grid" style={{gridTemplateColumns: 'minmax(0, 1.5fr) minmax(250px, .7fr)'}}>
        <section className="panel panel-pad">
          <div style={{display: 'flex', gap: 10, alignItems: 'center', marginBottom: 17}}>
            <span className="brand-mark"><Sparkles size={14}/></span>
            <div>
              <div className="panel-title">Ask about this workspace</div>
              <div className="panel-caption">Answers use only available sample context.</div>
            </div>
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <input
              className="field"
              style={{flex: 1, height: 42}}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder="Ask about tasks, decisions, or operational context…"
              data-testid="input-intelligence-question"
            />
            <button className="btn btn-primary" onClick={() => ask()} data-testid="button-intelligence-ask">
              Ask <ArrowRight size={14}/>
            </button>
          </div>
          <div style={{display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12}}>
            {prompts.map(p => (
              <button
                className="btn btn-small"
                key={p}
                onClick={() => {setQuestion(p); ask(p);}}
                data-testid={`button-sample-question-${prompts.indexOf(p)}`}
              >
                {p}
              </button>
            ))}
          </div>
          {answer && (
            <div style={{marginTop: 20, padding: '16px', background: '#f2f0e8', borderRadius: 8}} data-testid="panel-intelligence-answer">
              <div className="eyebrow" style={{marginBottom: 7}}>SAMPLE WORKSPACE RESPONSE</div>
              <p style={{fontSize: 12, lineHeight: 1.7, color: '#5b6059', margin: '0 0 12px'}}>{answer.text}</p>
              <div style={{fontSize: 9, color: '#8b8980', letterSpacing: '.3px'}}>
                Source records: {answer.refs.map(r => recordName(r)).join(', ')}
              </div>
            </div>
          )}
        </section>
        <section className="panel panel-pad">
          <div className="panel-title" style={{marginBottom: 12}}>Sample insights</div>
          <div className="activity-list">
            {data.insights.slice(0, 4).map(item => (
              <div className="activity-row" key={item.id}>
                <div>
                  <div className="row-main">{item.name}</div>
                  <div className="row-meta">{item.category} · {item.createdAt}</div>
                </div>
                <span className="pill info row-tail">{item.confidence}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function InsightsPage(){
  return (
    <ResourcePage
      eyebrow="INTELLIGENCE · DEMO DATA"
      title="Insight register"
      subtitle="Sample observations kept alongside their source records for human review."
      collection="insights"
      columns={[
        {key: 'name', label: 'Observation'},
        {key: 'category', label: 'Area'},
        {key: 'confidence', label: 'Evidence type'},
        {key: 'createdAt', label: 'Created'},
        {key: 'status', label: 'Status'}
      ]}
      createLabel="Add observation"
      fields={['name', 'category', 'summary', 'confidence', 'sourceRecords', 'createdAt']}
      description="Sample insight data only. No live AI or model connection is active."
    />
  );
}

export function ReportsPage(){
  return (
    <ResourcePage
      eyebrow="INTELLIGENCE"
      title="Report explorer"
      subtitle="Find organizational snapshots and recurring views."
      collection="reports"
      columns={[
        {key: 'name', label: 'Report'},
        {key: 'category', label: 'Area'},
        {key: 'owner', label: 'Owner'},
        {key: 'period', label: 'Period'},
        {key: 'modified', label: 'Modified'},
        {key: 'status', label: 'Status'}
      ]}
      createLabel="Create report"
      fields={['name', 'category', 'owner', 'period', 'modified']}
    />
  );
}
