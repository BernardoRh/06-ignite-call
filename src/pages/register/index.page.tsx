import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { Container, Form, FormErrors, Header } from './styles'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { api } from '@/lib/axios'
import { AxiosError } from 'axios'
import { NextSeo } from 'next-seo'

const RegisterFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Usario precisa ter ao menos 3 letras' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'Usario pode ter apenas letras e hifens',
    })
    .transform((username) => username.toLowerCase()),
  name: z.string().min(3, { message: 'Nome precisa ter ao menos 3 letras' }),
})

type RegisterFormData = z.infer<typeof RegisterFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
  })

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post('/users', {
        name: data.name,
        username: data.username,
      })

      await router.push('register/connect-calendar')
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.data?.message) {
        alert(error.response.data.message)
        return
      }
      console.error(error)
    }
  }

  const router = useRouter()

  useEffect(() => {
    if (router.query.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])

  return (
    <>
      <NextSeo title="Crie uma conta - Ignite Call" />
      <Container>
        <Header>
          <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
          <Text>
            Precisamos de algumas informações para criar seu perfil! Ah, você
            pode editar essas informações depois.
          </Text>
          <MultiStep size={4} currentStep={1} />
        </Header>

        <Form as="form" onSubmit={handleSubmit(handleRegister)}>
          <label>
            <Text size="sm">Nome de Usuario</Text>
            <TextInput
              prefix="ignite.com/"
              placeholder="seu-usuario"
              crossOrigin={undefined}
              {...register('username')}
            />
            {errors.username && (
              <FormErrors size="sm">{errors.username.message}</FormErrors>
            )}
          </label>
          <label>
            <Text size="sm">Nome de Completo</Text>
            <TextInput
              placeholder="Seu nome"
              crossOrigin={undefined}
              {...register('name')}
            />
            {errors.name && (
              <FormErrors size="sm">{errors.name.message}</FormErrors>
            )}
          </label>

          <Button type="submit" disabled={isSubmitting}>
            Proximo Passo
            <ArrowRight />
          </Button>
        </Form>
      </Container>
    </>
  )
}
