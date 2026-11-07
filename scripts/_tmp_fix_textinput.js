const fs = require('fs');

const data = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
const oldData = JSON.parse(fs.readFileSync('/tmp/old_tokens.json', 'utf8'));

const oldSet = oldData['tier_3/text-input']['text_input'];
const currentGroup = data['tier_3/text-input']['tier_3_text_input'];
const currentIcon = currentGroup.icon;

const merged = {
  color: oldSet.color,
  'border-width': oldSet['border-width'],
  'border-radius': oldSet['border-radius'],
  padding: oldSet.padding,
  gap: oldSet.gap,
  text: oldSet.text,
  'label-text': oldSet['label-text'],
  icon: currentIcon,
};

data['tier_3/text-input']['tier_3_text_input'] = merged;

fs.writeFileSync('tokens.json', JSON.stringify(data, null, 2));
console.log('OK wrote merged text-input set');
