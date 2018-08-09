import UDP    from 'dgram'
import colors from 'colors/safe'

const Server  = UDP.createSocket('udp4')

let userList = []

Server.on('error', (err) => {
  console.err(colors.bgRed('Server error') + colors.gray(`\n\n${err.stack}`))
  server.close()
})

Server.on('message', (msg, info) => {
  try {
    let isVaild = userList.filter(e => (e.address === info.address && e.port === info.port))
    let userIndex = userList.indexOf(...isVaild)
    if (isVaild.length === 0) {
      sendMessage(WelcomeMsg(), info)
      sendMessage('Set your nickname to join chat: ', info)
      delete info.size
      info.newmember = true
      userList.push(info)
    } else if (isVaild[0].newmember) {
      if (msg.toString('utf8').replace(/\s+/g, '') === '' || userList.filter(e => e.nickname === msg.toString('utf8').replace(/\s+/g, '')).length !== 0) {
        sendMessage('Nickname must duplicate or typo you input may include incorrect char: ', info)
      } else {
        let newMsg = 
          colors.yellow(' + New member ') +
          colors.underline.yellow(msg.toString('utf8').replace(/\s+/g, '').trim()) +
          colors.yellow(' join.\n')
    
        console.info(newMsg)
        userList.filter(e => (!e.newmember)).forEach(existUser => sendMessage(newMsg, existUser))
        sendMessage(
          colors.gray('\n\n-------------------\n') +
          colors.yellow('\nRoom:\n\n') +
          colors.underline.yellow(
            userList.filter(e => (!e.newmember)).map((existUser, i) => (` ${(i + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })} ${existUser.nickname}`)).join('\n')
          ) +
          colors.gray('\n\n-------------------\n') +
          'Join chat as ' +
          colors.underline.yellow(msg.toString('utf8').replace(/\s+/g, '').trim()) +
          colors.gray('\n-------------------\n\n')
        , info)
        userList[userIndex].nickname = msg.toString('utf8').replace(/\s+/g, '').trim()
        userList[userIndex].newmember = false
      }
    } else if (msg.indexOf('/') === 0) {
      switch (msg.toString('utf8')[1]) {
        case 'q':
          let newMsg = 
            colors.yellow(' - User ') +
            colors.underline.yellow(userList[userIndex].nickname) +
            colors.yellow(' offline.\n')
          
          userList.forEach(info => sendMessage(newMsg, info))
          delete userList[userIndex]
          break
        case 'h':
          sendMessage('沒有人會來幫你喔Owo\n', info)
          break
        default:
          sendMessage('Command Syntax error.\n', info)
      }
    } else {
      let message = colors.cyan(
        `[${
          userList[userIndex].nickname ?
          userList[userIndex].nickname :
          info.address
            .split('.')
            .map(e => parseInt(e).toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping:false }))
            .join('.')
        }]: `
      ) + msg.toString('utf8')
      console.info(message.replace(/\s+/g, ' ').trim())
      userList.filter((e, i) => (i !== userIndex && !e.newmember)).forEach(info => sendMessage(message, info))
    }
  } catch (err) {
    throw new Error(err)
  }
})

Server.on('listening', () => {
  console.clear()
  console.info(WelcomeMsg())
})

Server.on('close', () => {
  sendMessage(colors.bgRed(' Server ERROR '))
  console.log('Socket is closed!')
})

const sendMessage = (msg, info) => {
  Server.send(Buffer.from(msg), 0, Buffer.from(msg).length, info.port, info.address)
}

const RandomPort = (max, min) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

const WelcomeMsg = () => {
  return colors.black.bgGreen(
      '\n\n' +
      ' • Server online • \n\n') +
    colors.cyan(
      '[==== Channel ====]\n' +
      '|                 |\n' +
      '|   '
    ) +
    colors.black.bgCyan(` CODE ${Server.address().port} `) +
    colors.cyan(
                     '   |\n' +
      '|                 |\n' +
      '[=================]\n\n'
    ) +
    colors.green(
      '/q: Logout, /h: help\n\n'
    ) +
    colors.red(
      'If you forgot to logout before disconnect, you will not allowed to use the same nickname at this session.\n\n'
    )
}

Server.bind(RandomPort(9999, 9500))
