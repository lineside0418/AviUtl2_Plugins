// src/pages/HowToInstallPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Linkコンポーネントをインポート

function HowToInstallPage() {
  return (
    <div className="how-to-install">
        <h1>AviUtl2 プラグイン・スクリプト導入方法</h1>
        <p>
          このページでは、AviUtl2にプラグインやスクリプトを導入する基本的な手順を説明します。<br />
          <strong>※個別のプラグイン・スクリプトの詳しい導入方法は、必ず配布元サイトの説明を確認してください。</strong>
        </p>

        <section>
          <h2>プラグインの導入手順</h2>
          <p>プラグインは、AviUtl2の機能を拡張したり、新しいフォーマットに対応させたりするために使用します。</p>
          <ol>
            <li>
              <strong>プラグインのダウンロード:</strong>{' '}
              <Link to="/plugins">プラグイン一覧</Link>から目的のプラグインを見つけ、配布サイトからファイルをダウンロードします。
            </li>
            <li>
              <strong>ファイルの解凍:</strong> ダウンロードした圧縮ファイル（例: ZIPファイル）を解凍します。
              <br />
              解凍ソフトがない場合は、Windowsの標準機能で解凍できます。
            </li>
            <li>
              <strong>ファイルの配置:</strong> 解凍して出てきたファイル（`.auf`, `.aui`, `.auo`などの拡張子を持つファイルやフォルダ）を、AviUtl2のインストールされているフォルダ内の適切な場所に移動します。
              <br />
              一般的には以下の場所です。
              <pre>C:\ProgramData\aviUtl2\Plugin</pre>
              プラグインによっては、特定のサブフォルダに入れる必要がある場合があります。
            </li>
            <li>
              <strong>AviUtl2での確認:</strong> AviUtl2を起動し、導入したプラグインが正しく認識されているか確認します。
              <br />
              「ファイル」メニュー &gt; 「環境設定」 &gt; 「システム設定」などで、追加したプラグインが表示されていれば成功です。
            </li>
          </ol>
        </section>

        <section>
          <h2>スクリプトの導入手順</h2>
          <p>スクリプトは、特定のアニメーション効果やカスタムオブジェクトを追加します。導入方法はプラグインと似ています。</p>
          <ol>
            <li>
              <strong>スクリプトのダウンロード:</strong>{' '}
              <Link to="/scripts">スクリプト一覧</Link>から目的のスクリプトを見つけ、配布サイトからファイルをダウンロードします。
            </li>
            <li>
              <strong>ファイルの解凍:</strong> ダウンロードした圧縮ファイルを解凍します。
            </li>
            <li>
              <strong>ファイルの配置:</strong> 解凍して出てきたスクリプトファイル（`.as`, `.anm`, `.obj`など）を、以下のフォルダに移動します。
              <br />
              こちらも隠しフォルダの場合があります。
              <pre>C:\ProgramData\AviUtl2\Script</pre>
            </li>
            <li>
              <strong>AviUtl2での確認:</strong> AviUtl2を起動し、追加したスクリプトが導入できていれば成功です。
              <br />
              拡張編集のタイムライン上で右クリック &gt; 「メディアオブジェクトの追加」や「フィルタオブジェクトの追加」から、追加されているか確認できます。
            </li>
          </ol>
        </section>

        <section>
          <h2>共通の注意点</h2>
          <ul>
            <li>
              プラグイン同士、またはスクリプト同士の相性問題が発生することがあります。
              問題が発生した場合は、最近追加したファイルを一時的に別の場所に移動させて原因を特定してみてください。
            </li>
          </ul>
        </section>

        <section>
          <h2>免責事項</h2>
          <p>
            当サイトで紹介しているプラグインおよびスクリプトの導入は、すべて自己責任でお願いいたします。
            導入によって生じたいかなる損害についても、当サイトは一切の責任を負いません。
          </p>
        </section>
    </div>
  );
}

export default HowToInstallPage;