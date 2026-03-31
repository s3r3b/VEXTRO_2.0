import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';

const CATEGORIES = [
  {
    icon: '😊',
    label: 'Twarze',
    emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍',
      '🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫',
      '🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤',
      '😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸',
      '😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨',
      '😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠',
      '🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸',
    ],
  },
  {
    icon: '👍',
    label: 'Gesty',
    emojis: [
      '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉',
      '👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝',
      '🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁',
      '🦷','🦴','👀','👁️','👅','👄','🫦','💋','🩸',
    ],
  },
  {
    icon: '❤️',
    label: 'Symbole',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗',
      '💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐',
      '⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️',
      '🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💯','🔛','🔝',
      '🔱','⚜️','🔰','♻️','✅','🈯','💹','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾',
    ],
  },
  {
    icon: '🐶',
    label: 'Zwierzęta',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵',
      '🙈','🙉','🙊','🐒','🦍','🦧','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉',
      '🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂',
      '🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳',
    ],
  },
  {
    icon: '🍕',
    label: 'Jedzenie',
    emojis: [
      '🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆',
      '🥑','🫑','🥦','🥬','🥒','🌶️','🌽','🥕','🧄','🧅','🥔','🍠','🫘','🥞','🧇',
      '🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯',
      '🫔','🥗','🥘','🫕','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍞','🥐','🥖',
    ],
  },
  {
    icon: '🚀',
    label: 'Podróże',
    emojis: [
      '🚀','✈️','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌',
      '🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛',
      '🚜','🏎️','🏍️','🛵','🦽','🦼','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽',
      '🚦','🚥','🛑','🚧','⚓','🛟','⛵','🚤','🛥️','🛳️','⛴️','🚢','🛩️','💺','🪂',
    ],
  },
  {
    icon: '⚽',
    label: 'Sport',
    emojis: [
      '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎳','🏏','🏑','🏒','🥍','🏓',
      '🏸','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥅','⛳','🎣','🤿','🎽','🎿','🛷',
      '🥌','🏹','🎯','🪃','🏋️','🤸','🤼','🤺','🤾','🏇','⛷️','🏂','🪂','🏊','🚵',
    ],
  },
  {
    icon: '🎵',
    label: 'Aktywności',
    emojis: [
      '🎵','🎶','🎸','🎹','🥁','🪘','🎷','🎺','🎻','🪕','🎤','🎧','🎼','🎹','🪗',
      '🎭','🎬','🎨','🖼️','🎪','🎠','🎡','🎢','💃','🕺','🎰','🎲','♟️','🧩','🪄',
      '🎯','🎳','🎮','🕹️','🎻','🎬','📺','📷','📸','📹','🎥','📽️','🎞️','📞','☎️',
    ],
  },
];

export default function EmojiPicker({ onSelect, visible }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');

  const displayedEmojis = useMemo(() => {
    if (search.trim()) {
      return CATEGORIES.flatMap(c => c.emojis).filter(e => e.includes(search));
    }
    return CATEGORIES[activeCategory].emojis;
  }, [activeCategory, search]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <TextInput
        style={styles.search}
        placeholder="Szukaj emoji..."
        placeholderTextColor="#555"
        value={search}
        onChangeText={setSearch}
      />

      {/* Category tabs */}
      {!search.trim() && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catRow}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 10 }}
        >
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.catBtn, activeCategory === i && styles.catBtnActive]}
              onPress={() => setActiveCategory(i)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Emoji grid */}
      <FlatList
        data={displayedEmojis}
        keyExtractor={(item, i) => `${item}-${i}`}
        numColumns={8}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.emojiCell} onPress={() => onSelect(item)}>
            <Text style={styles.emoji}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 6 }}
        showsVerticalScrollIndicator={false}
        style={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  search: {
    height: 38,
    backgroundColor: '#1A1A1A',
    color: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 8,
    paddingHorizontal: 14,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  catRow: {
    maxHeight: 42,
    flexGrow: 0,
    marginBottom: 4,
  },
  catBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBtnActive: {
    backgroundColor: 'rgba(176,38,255,0.25)',
    borderWidth: 1,
    borderColor: '#B026FF',
  },
  catIcon: { fontSize: 20 },
  grid: { flex: 1 },
  emojiCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  emoji: { fontSize: 26 },
});
