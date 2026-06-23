<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>ច្បាប់ហ្គេម</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rules-content">
      <h2 class="section-title">ច្បាប់ហ្គេម Tien Len Mien Bac</h2>
      <p class="intro-text">
        ហ្គេមនេះប្រើច្បាប់បៀ Tien Len Mien Bac បែប Khmer-style ដោយលេងជា 4 នាក់។
      </p>

      <section class="rule-section">
        <h3>ច្បាប់ទូទៅ</h3>
        <ul class="rules-list">
          <li>ប្រើបៀ 52 សន្លឹក។</li>
          <li>លំដាប់តម្លៃបៀគឺ៖ 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A, 2។</li>
          <li>លំដាប់កម្លាំងស៊ុតគឺ៖ ♠ Spades, ♣ Clubs, ♦ Diamonds, ♥ Hearts។</li>
          <li>អ្នកលេងម្នាក់ៗទទួលបានបៀ 13 សន្លឹក។</li>
          <li>អ្នកដែលមាន 3♠ ត្រូវចាប់ផ្តើមមុនគេ។</li>
          <li>ពេលតុទទេ អ្នកលេងអាចដាក់បៀណាមួយដែលត្រឹមត្រូវបាន។</li>
          <li>អ្នកលេងត្រូវដាក់បៀឱ្យធំជាងបៀមុន ឬ Pass។</li>
          <li>អាច Pass បានតែបន្ទាប់ពីមានអ្នកដាក់បៀលើតុរួច។</li>
          <li>
            Pass មានន័យថារំលងតែវេនបច្ចុប្បន្ន ប៉ុន្តែវេនបន្ទាប់អាចលេងវិញបាន។
          </li>
          <li>
            បើអ្នកលេងផ្សេងទាំងអស់ Pass តុត្រូវបានសម្អាត ហើយចាប់ផ្តើមជុំថ្មី។
          </li>
          <li>អ្នកដែលអស់បៀហើយ ត្រូវបានរំលងវេន។</li>
          <li>ហ្គេមបន្តរហូតដល់កំណត់ចំណាត់ថ្នាក់អ្នកលេងទាំងអស់។</li>
        </ul>
      </section>

      <section class="rule-section">
        <h3>ប្រភេទបៀដែលអាចដាក់បាន</h3>
        <ul class="rules-list">
          <li>Single: បៀ 1 សន្លឹក។</li>
          <li>Pair: បៀ 2 សន្លឹកដែលមានតម្លៃដូចគ្នា។</li>
          <li>Triple: បៀ 3 សន្លឹកដែលមានតម្លៃដូចគ្នា។</li>
          <li>Four of a kind: បៀ 4 សន្លឹកដែលមានតម្លៃដូចគ្នា។</li>
          <li>
            Straight / Sequence: បៀ 3 សន្លឹក ឬច្រើនជាងនេះ ដែលមានតម្លៃជាប់គ្នា។
          </li>
          <li>Double pairs: គូបៀ 2 គូជាប់លំដាប់គ្នា។</li>
          <li>Three consecutive pairs: គូបៀ 3 គូជាប់លំដាប់គ្នា។</li>
          <li>Four consecutive pairs: គូបៀ 4 គូជាប់លំដាប់គ្នា។</li>
          <li>Pair plus triple: មាន 1 pair និង 1 triple។</li>
          <li>
            Five-card same-suit sequence bomb: បៀ 5 សន្លឹកជាប់លំដាប់គ្នា
            និងមានស៊ុតដូចគ្នា។
          </li>
        </ul>
      </section>

      <section class="rule-section">
        <h3>ច្បាប់ Triple</h3>
        <ul class="rules-list">
          <li>Triple អាចឈ្នះ Triple ផ្សេងទៀត បើមានតម្លៃខ្ពស់ជាង។</li>
        </ul>
        <div class="example-box">
          <p>ឧទាហរណ៍៖</p>
          <p>J J J ឈ្នះ 10 10 10</p>
          <p>A A A ឈ្នះ K K K</p>
        </div>
      </section>

      <section class="rule-section">
        <h3>ច្បាប់ Straight / Sequence</h3>
        <ul class="rules-list">
          <li>
            Straight គឺបៀ 3 សន្លឹក ឬច្រើនជាងនេះ ដែលមានតម្លៃជាប់លំដាប់គ្នា។
          </li>
          <li>ស៊ុតមិនចាំបាច់ដូចគ្នាទេ។</li>
          <li>បៀ 2 មិនអាចប្រើក្នុង Straight បានទេ។</li>
          <li>Straight អាចរត់បានពី 3 ដល់ A ប៉ុណ្ណោះ។</li>
          <li>មិនអាចបន្តពី A ត្រឡប់ទៅ 3 បានទេ។</li>
        </ul>
        <div class="example-box">
          <p>ត្រឹមត្រូវ៖ 3 4 5, 6 7 8 9, 10 J Q K A, Q K A</p>
          <p>មិនត្រឹមត្រូវ៖ K A 2, A 2 3, 2 3 4</p>
        </div>
      </section>

      <section class="rule-section">
        <h3>ច្បាប់ Consecutive Pairs</h3>

        <h4>Double Pairs</h4>
        <ul class="rules-list">
          <li>Double pairs គឺគូបៀ 2 គូជាប់លំដាប់គ្នា។</li>
          <li>
            អាចឈ្នះ Double pairs ផ្សេងទៀតបាន បើគូខ្ពស់បំផុតមានតម្លៃខ្ពស់ជាង។
          </li>
          <li>Double pairs មិនអាចឈ្នះបៀ 2 មួយសន្លឹកបានទេ។</li>
          <li>Double pairs មិនអាចឈ្នះ Pair of 2 បានទេ។</li>
          <li>Double pairs មិនមាន point cutting ទេ។</li>
        </ul>

        <h4>Three Consecutive Pairs</h4>
        <ul class="rules-list">
          <li>គឺគូបៀ 3 គូជាប់លំដាប់គ្នា។</li>
          <li>
            អាចឈ្នះ Three consecutive pairs ផ្សេងទៀតបាន
            បើគូខ្ពស់បំផុតមានតម្លៃខ្ពស់ជាង។
          </li>
          <li>មិនអាចឈ្នះបៀ 2 មួយសន្លឹក ឬ Pair of 2 បានទេ។</li>
          <li>មិនមែនជា Bomb ទេ និងមិនមាន point cutting ទេ។</li>
          <li>បៀ 2 មិនអាចប្រើក្នុង consecutive pairs បានទេ។</li>
        </ul>

        <h4>Four Consecutive Pairs</h4>
        <ul class="rules-list">
          <li>គឺគូបៀ 4 គូជាប់លំដាប់គ្នា។</li>
          <li>អាចដាក់បានពេលតុទទេ ឬពេលឈ្នះ Four consecutive pairs ផ្សេងទៀត។</li>
          <li>អាចឈ្នះ Pair of 2 បាន។</li>
          <li>មិនអាចឈ្នះបៀ 2 មួយសន្លឹកបានទេ។</li>
          <li>Four consecutive pairs ជាចលនាតែមួយគត់ដែលអាចឈ្នះ Pair of 2។</li>
          <li>មាន point cutting តែពេលឈ្នះ Pair of 2 ប៉ុណ្ណោះ។</li>
          <li>បៀ 2 មិនអាចប្រើក្នុង consecutive pairs បានទេ។</li>
        </ul>
      </section>

      <section class="rule-section">
        <h3>ច្បាប់ Bomb</h3>
        <p class="intro-text">
          Bomb គឺជាចលនាពិសេសដែលអាចឈ្នះបៀ 2 មួយសន្លឹក ឬឈ្នះ Bomb ដែលខ្សោយជាង។
        </p>

        <ul class="rules-list">
          <li>
            Bomb ដែលអាចឈ្នះ Single 2 មាន៖ Four of a kind និង Five-card same-suit
            sequence។
          </li>
          <li>
            លំដាប់កម្លាំង Bomb៖ Four of a kind &lt; Five-card same-suit
            sequence។
          </li>
        </ul>

        <h4>Four of a Kind</h4>
        <ul class="rules-list">
          <li>Four of a kind គឺបៀ 4 សន្លឹកដែលមានតម្លៃដូចគ្នា។</li>
          <li>អាចឈ្នះបៀ 2 មួយសន្លឹកបាន។</li>
          <li>មិនអាចឈ្នះ Pair of 2 បានទេ។</li>
          <li>អាចត្រូវបានឈ្នះដោយ Five-card same-suit sequence។</li>
          <li>Four of a kind ខ្ពស់ជាង ឈ្នះ Four of a kind ទាបជាង។</li>
        </ul>

        <h4>Five-card Same-suit Sequence</h4>
        <ul class="rules-list">
          <li>គឺបៀ 5 សន្លឹកជាប់លំដាប់គ្នា និងមានស៊ុតដូចគ្នា។</li>
          <li>ខ្លាំងជាង Four of a kind។</li>
          <li>អាចឈ្នះបៀ 2 មួយសន្លឹកបាន។</li>
          <li>មិនអាចឈ្នះ Pair of 2 បានទេ។</li>
          <li>អាចឈ្នះ Four of a kind បាន។</li>
          <li>បៀ 2 មិនអាចប្រើក្នុង sequence នេះបានទេ។</li>
          <li>មិនអាចបន្តពី A ត្រឡប់ទៅ 3 បានទេ។</li>
        </ul>
      </section>

      <section class="rule-section">
        <h3>ច្បាប់ Pair of 2</h3>
        <ul class="rules-list">
          <li>
            Single 2 អាចត្រូវបានឈ្នះដោយ Four of a kind ឬ Five-card same-suit
            sequence។
          </li>
          <li>
            Pair of 2 អាចត្រូវបានឈ្នះតែដោយ Four consecutive pairs ប៉ុណ្ណោះ។
          </li>
          <li>Four of a kind មិនអាចឈ្នះ Pair of 2 បានទេ។</li>
          <li>Five-card same-suit sequence មិនអាចឈ្នះ Pair of 2 បានទេ។</li>
          <li>Three consecutive pairs មិនអាចឈ្នះ Pair of 2 បានទេ។</li>
          <li>Four consecutive pairs មិនអាចឈ្នះ Single 2 បានទេ។</li>
        </ul>
      </section>

      <section class="rule-section">
        <h3>ច្បាប់ Beat</h3>
        <ul class="rules-list">
          <li>
            ចលនាប្រភេទដូចគ្នា និងចំនួនបៀដូចគ្នា អាចឈ្នះគ្នាបាន បើមានបៀខ្ពស់ជាង។
          </li>
          <li>Single ឈ្នះ Single ដោយមើលតម្លៃបៀសិន បន្ទាប់មកមើលកម្លាំងស៊ុត។</li>
          <li>Pair ឈ្នះ Pair ដោយមើលតម្លៃ Pair។</li>
          <li>Triple ឈ្នះ Triple ដោយមើលតម្លៃ Triple។</li>
          <li>
            Straight ឈ្នះ Straight បាន តែបើមានចំនួនបៀដូចគ្នា
            និងបៀខ្ពស់បំផុតខ្ពស់ជាង។
          </li>
          <li>
            Double pairs ឈ្នះ Double pairs តែបើមានចំនួនបៀដូចគ្នា
            និងគូខ្ពស់បំផុតខ្ពស់ជាង។
          </li>
          <li>
            Three consecutive pairs ឈ្នះ Three consecutive pairs
            ដោយមើលគូខ្ពស់បំផុត។
          </li>
          <li>
            Four consecutive pairs ឈ្នះ Four consecutive pairs
            ដោយមើលគូខ្ពស់បំផុត។
          </li>
          <li>
            Pair plus triple ឈ្នះគ្នាដោយមើល Triple ខ្ពស់ជាង បន្ទាប់មក Pair
            ខ្ពស់ជាង។
          </li>
          <li>Bomb ខ្លាំងជាង អាចឈ្នះ Bomb ខ្សោយជាង។</li>
          <li>Bomb ប្រភេទដូចគ្នា ប្រៀបធៀបតាមបៀខ្ពស់បំផុត។</li>
        </ul>
      </section>

      <section class="rule-section">
        <h3>ច្បាប់ Point Cutting</h3>
        <p class="intro-text">Point cutting អនុវត្តតែក្នុងករណីខាងក្រោម៖</p>

        <ul class="rules-list">
          <li>Four of a kind ឈ្នះ Single 2។</li>
          <li>Five-card same-suit sequence ឈ្នះ Single 2។</li>
          <li>Four consecutive pairs ឈ្នះ Pair of 2។</li>
        </ul>

        <h4>Single 2 Cut</h4>
        <ul class="rules-list">
          <li>អ្នកដែលដាក់ Single 2 ត្រូវ -10 ពិន្ទុ។</li>
          <li>អ្នកដែលឈ្នះ Single 2 ទទួលបាន +10 ពិន្ទុ។</li>
        </ul>

        <h4>Pair of 2 Cut</h4>
        <ul class="rules-list">
          <li>អ្នកដែលដាក់ Pair of 2 ត្រូវ -20 ពិន្ទុ។</li>
          <li>អ្នកដែលដាក់ Four consecutive pairs ទទួលបាន +20 ពិន្ទុ។</li>
        </ul>

        <h4>Bomb Chain Cut</h4>
        <ul class="rules-list">
          <li>
            បើមាន Bomb ជាបន្តបន្ទាប់ក្នុង chain របស់ Single 2
            អ្នកដែលឈ្នះចុងក្រោយ ទទួល point cut ទាំងអស់។
          </li>
        </ul>

        <div class="example-box">
          <p>ឧទាហរណ៍៖</p>
          <p>Player 1 ដាក់ 2♠</p>
          <p>Player 2 ដាក់ 2♥</p>
          <p>Player 3 ដាក់ 10♠ 10♣ 10♦ 10♥</p>
          <p>Player 4 ដាក់ 10♥ J♥ Q♥ K♥ A♥</p>
          <p>លទ្ធផល៖ Player 4 ទទួល +30 ពិន្ទុ។</p>
        </div>
      </section>

      <section class="rule-section">
        <h3>ច្បាប់ពិន្ទុចំណាត់ថ្នាក់</h3>
        <ul class="rules-list">
          <li>លេខ 1: +10 ពិន្ទុ។</li>
          <li>លេខ 2: +5 ពិន្ទុ។</li>
          <li>លេខ 3: -5 ពិន្ទុ។</li>
          <li>លេខ 4: -10 ពិន្ទុ។</li>
          <li>Point cutting ត្រូវបានបូកបន្ថែមលើពិន្ទុចំណាត់ថ្នាក់។</li>
        </ul>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
</script>
<style scoped>
.rules-content {
  --background: linear-gradient(180deg, #f7f8ff 0%, #ffffff 38%);
  --padding-top: 18px;
  --padding-bottom: 28px;
  --padding-start: 16px;
  --padding-end: 16px;
}

/* Ionic header */
ion-toolbar {
  --background: linear-gradient(135deg, #1e293b, #334155);
  --color: #ffffff;
  --border-width: 0;
}

ion-title {
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Main title */
.section-title {
  margin: 4px 0 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22);
}

/* Short description */
.intro-text {
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  line-height: 1.65;
  font-size: 0.98rem;
  color: #475569;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

/* Card sections */
.rule-section {
  position: relative;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.07);
  overflow: hidden;
}

.rule-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(180deg, #2563eb, #7c3aed);
}

/* Section title */
.rule-section h3 {
  margin: 0 0 12px;
  padding-left: 4px;
  font-size: 1.12rem;
  font-weight: 800;
  color: #0f172a;
}

.rule-section h4 {
  margin: 16px 0 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f1f5f9;
  font-size: 0.98rem;
  font-weight: 700;
  color: #334155;
}

/* List */
.rules-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
  line-height: 1.65;
  font-size: 0.96rem;
  color: #334155;
}

.rules-list li {
  position: relative;
  margin-bottom: 9px;
  padding-left: 26px;
}

.rules-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  top: 1px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0284c7;
  font-size: 0.72rem;
  font-weight: 800;
  text-align: center;
  line-height: 18px;
}

/* Example box */
.example-box {
  margin-top: 12px;
  padding: 13px 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  border: 1px solid #fed7aa;
  line-height: 1.65;
  font-size: 0.94rem;
  color: #7c2d12;
}

.example-box p {
  margin: 5px 0;
}

/* Make card feel clickable / modern */
.rule-section {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.rule-section:active {
  transform: scale(0.99);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
}

/* Better mobile spacing */
@media (max-width: 420px) {
  .section-title {
    font-size: 1.2rem;
    padding: 13px 14px;
  }

  .rule-section {
    padding: 14px;
    border-radius: 16px;
  }

  .rule-section h3 {
    font-size: 1.05rem;
  }

  .rules-list {
    font-size: 0.93rem;
  }
}
</style>
