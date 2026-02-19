const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function test() {
  const { stdout } = await execAsync('openclaw sessions --active 10 --json');
  const data = JSON.parse(stdout);
  console.log('Raw data:', JSON.stringify(data, null, 2));
  
  const sessions = data.sessions || [];
  console.log('\nFirst session:',sessions[0]);
  
  const mapped = sessions.map(s => ({
    sessionKey: s.key,
    sessionId: s.sessionId,
    agentType: s.key ? s.key.split(':')[1] : 'unknown',
    model: s.model
  }));
  
  console.log('\nMapped:', JSON.stringify(mapped, null, 2));
}

test().catch(console.error);
