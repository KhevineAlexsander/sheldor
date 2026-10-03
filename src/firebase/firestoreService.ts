import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Unsubscribe
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './config';
import { BotChatMessage, ClanData, DungeonParty, PlayerProfile } from '../types/rpgBot';
import { INITIAL_CLANS, INITIAL_PROFILES, migrarPerfilParaV3, criarInstanciaPicareta, criarInstanciaEquip } from '../engine/gameData';

export async function saveUserAccount(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Guerreiro',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeProfiles(
  onProfiles: (profiles: PlayerProfile[]) => void,
  currentUser: User | null
): Unsubscribe {
  const path = 'profiles';
  const profilesCol = collection(db, path);

  return onSnapshot(
    profilesCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // If not logged in, just pass local initial profiles without attempting unauthenticated writes
        if (!currentUser) {
          onProfiles(INITIAL_PROFILES);
          return;
        }

        // Authenticated: Seed with currentUser.uid as donoId so security rules pass
        const userSlug = (currentUser.displayName || 'Guerreiro')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');

        const userProfile = migrarPerfilParaV3({
          id: userSlug || `p_${currentUser.uid.slice(0, 8)}`,
          nome: currentUser.displayName || 'Guerreiro',
          donoId: currentUser.uid,
          avatar: '⚔️',
          nivel: 1,
          xp: 0,
          xpProximo: 100,
          hp: 180,
          hpMax: 180,
          ataqueBase: 22,
          defesaBase: 12,
          energia: 100,
          energiaMax: 100,
          ultimaAtualizacaoEnergia: Date.now(),
          moedas: 500,
          vitoriasPvP: 0,
          derrotasPvP: 0,
          dungeonsCompletadas: 0,
          ferramenta: criarInstanciaPicareta('madeira'),
          equipamentos: {
            elmo: criarInstanciaEquip('elmo_couro', 'comum'),
            armadura: criarInstanciaEquip('armadura_couro', 'comum'),
            calca: criarInstanciaEquip('calca_couro', 'comum'),
            botas: criarInstanciaEquip('botas_couro', 'comum'),
            arma: criarInstanciaEquip('espada_madeira', 'comum'),
            escudo: null
          },
          inventario: [
            { uid: 'inv_init_1', itemId: 'pocao_cura_p', nome: 'Poção de Cura P', quantidade: 2, tipo: 'consumivel', icone: '🧪', precoVenda: 25 },
            { uid: 'inv_init_2', itemId: 'pedra', nome: 'Pedra Rústica', quantidade: 5, tipo: 'material', icone: '🪨', precoVenda: 15 }
          ],
          bauEspera: [],
          buffs: [],
          toxicidade: 0,
          ultimaAtualizacaoToxicidade: Date.now(),
          elixires: { vitalidade: 0, poder: 0, guarda: 0 },
          cooldowns: {
            mine: 0,
            trabalhar: 0,
            arena: 0,
            duelo: 0,
            dungeon: 0,
            curar: 0,
            consertar: 0,
            forjar: 0,
            fundir: 0,
            encantar: 0,
            pocaoCura: 0,
            roleta: 0,
            petTreinar: 0
          },
          contadores24h: {
            mine: [],
            trabalhar: [],
            pocoesCura: [],
            roletaContador: 0,
            duelosPorOponente: {}
          },
          diario: {
            data: new Date().toISOString().slice(0, 10),
            streak: 1,
            coletadoHoje: false,
            pocoesEnergiaCompradas: 0,
            pocoesCuraUsadasHoje: 0,
            questsConcluidas: []
          },
          pet: null,
          claId: null
        });

        const initialSeeds = [userProfile, ...INITIAL_PROFILES.map((p) => ({ ...p, donoId: currentUser.uid }))];

        for (const p of initialSeeds) {
          try {
            await setDoc(doc(db, 'profiles', p.id), p);
          } catch (e) {
            console.warn('Seed profile write notice:', p.id, e);
          }
        }

        onProfiles(initialSeeds);
        return;
      }

      const list: PlayerProfile[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as PlayerProfile);
      });

      // If user is authenticated and doesn't have a profile yet in existing collection, create one
      if (currentUser) {
        const hasMyProfile = list.some((p) => p.donoId === currentUser.uid);
        if (!hasMyProfile) {
          const userSlug = (currentUser.displayName || 'Guerreiro')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_');
          const cleanId = `${userSlug}_${currentUser.uid.slice(0, 4)}`;
          const newProfile = migrarPerfilParaV3({
            id: cleanId,
            nome: currentUser.displayName || 'Guerreiro',
            donoId: currentUser.uid,
            avatar: '⚔️',
            nivel: 1,
            xp: 0,
            xpProximo: 100,
            hp: 180,
            hpMax: 180,
            ataqueBase: 22,
            defesaBase: 12,
            energia: 100,
            energiaMax: 100,
            ultimaAtualizacaoEnergia: Date.now(),
            moedas: 500,
            vitoriasPvP: 0,
            derrotasPvP: 0,
            dungeonsCompletadas: 0,
            ferramenta: criarInstanciaPicareta('madeira'),
            equipamentos: {
              elmo: criarInstanciaEquip('elmo_couro', 'comum'),
              armadura: criarInstanciaEquip('armadura_couro', 'comum'),
              calca: criarInstanciaEquip('calca_couro', 'comum'),
              botas: criarInstanciaEquip('botas_couro', 'comum'),
              arma: criarInstanciaEquip('espada_madeira', 'comum'),
              escudo: null
            },
            inventario: [
              { uid: 'inv_init_3', itemId: 'pocao_cura_p', nome: 'Poção de Cura P', quantidade: 2, tipo: 'consumivel', icone: '🧪', precoVenda: 25 },
              { uid: 'inv_init_4', itemId: 'pedra', nome: 'Pedra Rústica', quantidade: 5, tipo: 'material', icone: '🪨', precoVenda: 15 }
            ],
            bauEspera: [],
            buffs: [],
            toxicidade: 0,
            ultimaAtualizacaoToxicidade: Date.now(),
            elixires: { vitalidade: 0, poder: 0, guarda: 0 },
            cooldowns: {
              mine: 0,
              trabalhar: 0,
              arena: 0,
              duelo: 0,
              dungeon: 0,
              curar: 0,
              consertar: 0,
              forjar: 0,
              fundir: 0,
              encantar: 0,
              pocaoCura: 0,
              roleta: 0,
              petTreinar: 0
            },
            contadores24h: {
              mine: [],
              trabalhar: [],
              pocoesCura: [],
              roletaContador: 0,
              duelosPorOponente: {}
            },
            diario: {
              data: new Date().toISOString().slice(0, 10),
              streak: 1,
              coletadoHoje: false,
              pocoesEnergiaCompradas: 0,
              pocoesCuraUsadasHoje: 0,
              questsConcluidas: []
            },
            pet: null,
            claId: null
          });

          try {
            await setDoc(doc(db, 'profiles', cleanId), newProfile);
            list.unshift(newProfile);
          } catch (e) {
            console.warn('Failed to auto-create user profile:', e);
          }
        }
      }

      onProfiles(list);
    },
    (error) => {
      console.warn('Profiles snapshot listener notice:', error.message);
      // Fallback to local profiles so UI never breaks
      onProfiles(INITIAL_PROFILES);
    }
  );
}

export async function resetAllProfilesToFreshStart(currentUser: User | null): Promise<PlayerProfile[]> {
  const freshSeeds: PlayerProfile[] = INITIAL_PROFILES.map((p) => ({
    ...p,
    donoId: currentUser ? currentUser.uid : (p.donoId || 'user_1')
  }));

  if (currentUser) {
    const userSlug = (currentUser.displayName || 'Guerreiro')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const userProfile = migrarPerfilParaV3({
      id: userSlug || `p_${currentUser.uid.slice(0, 8)}`,
      nome: currentUser.displayName || 'Guerreiro',
      donoId: currentUser.uid,
      avatar: '⚔️',
      nivel: 1,
      xp: 0,
      xpProximo: 100,
      hp: 180,
      hpMax: 180,
      ataqueBase: 22,
      defesaBase: 12,
      energia: 100,
      energiaMax: 100,
      ultimaAtualizacaoEnergia: Date.now(),
      moedas: 500,
      vitoriasPvP: 0,
      derrotasPvP: 0,
      dungeonsCompletadas: 0,
      ferramenta: criarInstanciaPicareta('madeira'),
      equipamentos: {
        elmo: criarInstanciaEquip('elmo_couro', 'comum'),
        armadura: criarInstanciaEquip('armadura_couro', 'comum'),
        calca: criarInstanciaEquip('calca_couro', 'comum'),
        botas: criarInstanciaEquip('botas_couro', 'comum'),
        arma: criarInstanciaEquip('espada_madeira', 'comum'),
        escudo: null
      },
      inventario: [
        { uid: 'inv_res_1', itemId: 'pocao_cura_p', nome: 'Poção de Cura P', quantidade: 2, tipo: 'consumivel', icone: '🧪', precoVenda: 25 },
        { uid: 'inv_res_2', itemId: 'pedra', nome: 'Pedra Rústica', quantidade: 5, tipo: 'material', icone: '🪨', precoVenda: 15 }
      ],
      bauEspera: [],
      buffs: [],
      toxicidade: 0,
      ultimaAtualizacaoToxicidade: Date.now(),
      elixires: { vitalidade: 0, poder: 0, guarda: 0 },
      cooldowns: {
        mine: 0,
        trabalhar: 0,
        arena: 0,
        duelo: 0,
        dungeon: 0,
        curar: 0,
        consertar: 0,
        forjar: 0,
        fundir: 0,
        encantar: 0,
        pocaoCura: 0,
        roleta: 0,
        petTreinar: 0
      },
      contadores24h: {
        mine: [],
        trabalhar: [],
        pocoesCura: [],
        roletaContador: 0,
        duelosPorOponente: {}
      },
      diario: {
        data: new Date().toISOString().slice(0, 10),
        streak: 1,
        coletadoHoje: false,
        pocoesEnergiaCompradas: 0,
        pocoesCuraUsadasHoje: 0,
        questsConcluidas: []
      },
      pet: null,
      claId: null
    });
    freshSeeds.unshift(userProfile);
  }

  for (const p of freshSeeds) {
    await savePlayerProfile(p);
  }

  return freshSeeds;
}

export async function savePlayerProfile(profile: PlayerProfile): Promise<void> {
  const path = `profiles/${profile.id}`;
  try {
    // Sanitize object removing any undefined values
    const cleanProfile = JSON.parse(JSON.stringify(profile));
    await setDoc(doc(db, 'profiles', profile.id), cleanProfile, { merge: true });
    
    // Local backup for instant recovery
    try {
      localStorage.setItem(`sheldor_profile_${profile.id}`, JSON.stringify(cleanProfile));
    } catch (_) {}
  } catch (error) {
    console.warn('Error saving player profile to Firestore:', error);
  }
}

export function subscribeClans(onClans: (clans: ClanData[]) => void): Unsubscribe {
  const path = 'clans';
  const clansCol = collection(db, path);

  return onSnapshot(
    clansCol,
    async (snapshot) => {
      if (snapshot.empty) {
        onClans(INITIAL_CLANS);
        return;
      }

      const list: ClanData[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ClanData);
      });
      onClans(list);
    },
    (error) => {
      console.warn('Clans snapshot listener notice:', error.message);
      onClans(INITIAL_CLANS);
    }
  );
}

export async function saveClanRecord(clan: ClanData): Promise<void> {
  const path = `clans/${clan.id}`;
  try {
    const cleanClan = JSON.parse(JSON.stringify(clan));
    await setDoc(doc(db, 'clans', clan.id), cleanClan, { merge: true });
  } catch (error) {
    console.warn('Error saving clan to Firestore:', error);
  }
}

export function subscribeParty(
  partyId: string,
  onParty: (party: DungeonParty | null) => void
): Unsubscribe {
  const path = `dungeon_parties/${partyId}`;
  return onSnapshot(
    doc(db, 'dungeon_parties', partyId),
    (snap) => {
      if (snap.exists()) {
        onParty(snap.data() as DungeonParty);
      } else {
        onParty(null);
      }
    },
    (error) => {
      console.warn('Party listener notice:', error.message);
    }
  );
}

export async function saveDungeonParty(party: DungeonParty): Promise<void> {
  const path = `dungeon_parties/${party.id}`;
  try {
    const cleanParty = JSON.parse(JSON.stringify(party));
    await setDoc(doc(db, 'dungeon_parties', party.id), cleanParty);
  } catch (error) {
    console.warn('Error saving dungeon party:', error);
  }
}

export async function deleteDungeonParty(partyId: string): Promise<void> {
  const path = `dungeon_parties/${partyId}`;
  try {
    await deleteDoc(doc(db, 'dungeon_parties', partyId));
  } catch (error) {
    console.warn('Error deleting dungeon party:', error);
  }
}

export function subscribeAllParties(onParties: (parties: DungeonParty[]) => void): Unsubscribe {
  const partiesCol = collection(db, 'dungeon_parties');
  return onSnapshot(
    partiesCol,
    (snapshot) => {
      const list: DungeonParty[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as DungeonParty);
      });
      onParties(list);
    },
    (error) => {
      console.warn('All parties listener notice:', error.message);
    }
  );
}

export function subscribeGlobalMessages(
  onMessages: (msgs: BotChatMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'global_messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) return;
      const list: BotChatMessage[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as BotChatMessage);
      });
      onMessages(list);
    },
    (error) => {
      console.warn('Global messages listener notice:', error.message);
    }
  );
}

export async function sendGlobalMessage(msg: BotChatMessage): Promise<void> {
  const path = `global_messages/${msg.id}`;
  try {
    await setDoc(doc(db, 'global_messages', msg.id), msg);
  } catch (error) {
    console.warn('Error sending global message to Firestore:', error);
  }
}
