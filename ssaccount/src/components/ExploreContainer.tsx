import React, { useState } from 'react';
import { IonButton, IonToast, IonLoading } from '@ionic/react'
import './ExploreContainer.css';
import { Clipboard } from '@ionic-native/clipboard';
import { HTTP } from '@ionic-native/http';

interface ContainerProps { }

type Account = [string, number, string, string]

function getAccounts () {
  return HTTP.get('https://my.ishadowx.biz', {}, {
    'user-agent': 'no'
  }).then(res => {
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(res.data, 'text/html')
    const items = [...doc.querySelectorAll('.portfolio-item')]
    const accounts: string[] = []
    items.forEach(item => {
      const account: Account = [] as any
      item.querySelectorAll('h4').forEach((h4, i) => {
        if (!h4) return
        const value = ((h4 as HTMLElement).textContent as string).split(':')[1]
        if (value) {
          account.push(i === 1 ? parseInt(value.trim(), 10) : value.trim())
        }
      })
      if (account.length === 4) {
        //  server port password method
        const ssurl = `ss://${btoa(account[3] + ':' + account[2])}@${account[0]}:${account[1]}`
        accounts.push(ssurl)
      }
    })
    return Clipboard.copy(accounts.join('\n'))
  })
}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const [[toastmsg, showtoast], setShowToast] = useState(['账号已经复制到粘贴板', false]);
  const [showLoading, setShowLoading] = useState(false)

  function handleclipboard() {
    setShowLoading(true)
    getAccounts().then(() => {
      setShowToast(['账号已经复制到粘贴板', true])
    }).catch(() => {
      setShowToast(['账号复制失败', true])
    }).finally(() => {
      setShowLoading(false)
    })
  }

  return (
    <div className="container">
      <IonButton size="large" onClick={handleclipboard} color="success" expand="block" shape="round">复制到粘贴板</IonButton>
      <br /><br />
      <IonButton size="large" expand="block" shape="round">导出到文件</IonButton>
      <IonToast
        isOpen={showtoast}
        onDidDismiss={() => setShowToast(['', false])}
        message={toastmsg}
        duration={1000}
      />
      <IonLoading
        isOpen={showLoading}
        onDidDismiss={() => setShowLoading(false)}
        message="请稍候..."
        duration={5000}
      />
    </div>
  );
};

export default ExploreContainer;
