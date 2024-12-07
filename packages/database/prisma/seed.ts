import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const seed = async () => {
  const isAlreadySeeded = await prisma.role.findFirst({
    where: {
      name: 'user',
    },
  })

  if (isAlreadySeeded) {
    return console.log('💿 Database is already seeded, skipping...')
  }

  console.time('🔑 Created permissions...')
  const entities = ['user', 'project']
  const actions = ['create', 'read', 'update', 'delete']
  const accesses = ['own', 'any'] as const

  const permissionsToCreate = []
  for (const entity of entities) {
    for (const action of actions) {
      for (const access of accesses) {
        permissionsToCreate.push({ entity, action, access })
      }
    }
  }
  await prisma.permission.createMany({ data: permissionsToCreate })
  console.timeEnd('🔑 Created permissions...')

  console.time('👑 Created roles...')
  await prisma.role.create({
    data: {
      name: 'admin',
      permissions: {
        connect: await prisma.permission.findMany({
          select: { id: true },
          where: { access: 'any' },
        }),
      },
    },
  })
  await prisma.role.create({
    data: {
      name: 'user',
      permissions: {
        connect: await prisma.permission.findMany({
          select: { id: true },
          where: { access: 'own' },
        }),
      },
    },
  })
  console.timeEnd('👑 Created roles...')
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
